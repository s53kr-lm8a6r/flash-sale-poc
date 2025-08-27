import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka } from "kafkajs";
import { NotificationsGateway } from "./notifications.gateway";
import { InMemorySalesRepository } from "./sales/inmemory.repository";
@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly repo: InMemorySalesRepository,
    private readonly ws: NotificationsGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    const brokers = this.config.get<string>("KAFKA_BROKERS");
    const topic = this.config.get<string>("KAFKA_TOPIC") ?? "transactions";
    if (!brokers) {
      this.logger.warn("KAFKA_BROKERS not set; Kafka consumer disabled.");
      return;
    }

    const kafka = new Kafka({
      clientId: "backend-svc",
      brokers: brokers.split(","),
    });
    const admin = kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [{ topic, numPartitions: 1 }],
      waitForLeaders: true,
    });
    await admin.disconnect();

    const consumer = kafka.consumer({ groupId: "backend-svc-group" });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const value = message.value?.toString();
          if (!value) return;
          const parsed = JSON.parse(value) as {
            transactionId: string;
            buyerName: string;
            saleId: string;
            type?: "paid" | "switch";
          };

          if (parsed.type === "switch") {
            this.ws.emitQueueSwitch({
              transactionId: parsed.transactionId,
              buyerName: parsed.buyerName,
              saleId: parsed.saleId,
            });
            return;
          }

          this.repo.addSuccessBuyer({
            transactionId: parsed.transactionId,
            saleId: parsed.saleId,
            buyerName: parsed.buyerName,
          });
          const sale = this.repo.decrementSaleQty(parsed.saleId);
          this.ws.emitSaleUpdate({
            saleId: parsed.saleId,
            remainingQty: sale?.productQty ?? 0,
            buyerName: parsed.buyerName,
          });
        } catch (err) {
          this.logger.error(
            `Error processing Kafka message: ${(err as Error).message}`,
          );
        }
      },
    });
  }
}
