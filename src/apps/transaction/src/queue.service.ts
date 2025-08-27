import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ObjectId } from "bson";
import { Kafka } from "kafkajs";
import { TransactionStore } from "./store";

@Injectable()
export class PaymentQueueService {
  private readonly logger = new Logger(PaymentQueueService.name);
  private readonly kafkaEnabled: boolean;
  private readonly kafkaTopic: string;
  private producer: ReturnType<Kafka["producer"]> | null = null;
  private readonly paymentTimestamps: Map<string, number> = new Map();
  private topicEnsured = false;

  constructor(
    private readonly store: TransactionStore,
    private readonly config: ConfigService,
  ) {
    this.kafkaEnabled = this.config.get("KAFKA_BROKERS") !== undefined;
    this.kafkaTopic = this.config.get("KAFKA_TOPIC") ?? "transactions";
  }

  private async getProducer(): Promise<ReturnType<Kafka["producer"]>> {
    if (this.producer) return this.producer;
    if (!this.kafkaEnabled) {
      this.logger.warn("Kafka not configured; messages will be skipped.");
      throw new Error("Kafka disabled");
    }
    const brokers = String(this.config.get("KAFKA_BROKERS")).split(",");
    const kafka = new Kafka({ clientId: "transaction-svc", brokers });

    // Ensure topic exists before producing
    await this.ensureTopic(kafka);

    const producer = kafka.producer();
    await producer.connect();
    this.producer = producer;
    return producer;
  }

  private async ensureTopic(kafka: Kafka): Promise<void> {
    if (this.topicEnsured) return;
    try {
      const admin = kafka.admin();
      await admin.connect();
      await admin.createTopics({
        topics: [{ topic: this.kafkaTopic, numPartitions: 1 }],
        waitForLeaders: true,
      });
      await admin.disconnect();
    } catch (err) {
      this.logger.warn(`Topic ensure skipped: ${(err as Error).message}`);
    }
    this.topicEnsured = true;
  }

  buy(buyerName: string): {
    transactionId: string;
    state: "payment" | "waiting";
  } {
    if (!this.store.sale) throw new Error("Sale not initialized");
    const capacity = this.store.sale.productQty;
    const transactionId = new ObjectId().toHexString();
    const record = { transactionId, buyerName, saleId: this.store.sale.id };
    const now = Date.now();
    if (this.store.buyers.payment.length < capacity) {
      this.store.buyers.payment.push(record);
      this.paymentTimestamps.set(transactionId, now);
      this.sortQueues();
      return { transactionId, state: "payment" };
    }
    this.store.buyers.waiting.push(record);
    this.sortQueues();
    return { transactionId, state: "waiting" };
  }

  async paid(transactionId: string): Promise<boolean> {
    const idx = this.store.buyers.payment.findIndex(
      (p) => p.transactionId === transactionId,
    );
    if (idx === -1) return false;
    const rec = this.store.buyers.payment.splice(idx, 1)[0];
    this.store.buyers.success.push(rec);
    this.cleanupPaymentTimestamp(transactionId);
    await this.emitKafka(rec.transactionId, rec.buyerName, rec.saleId);
    this.fillPaymentFromWaiting();
    this.sortQueues();
    return true;
  }

  cleanupStale(maxAgeMs = 60_000): void {
    const tsMap = this.paymentTimestamps;
    const now = Date.now();
    const toRemove = this.store.buyers.payment.filter((p) => {
      const ts = tsMap.get(p.transactionId) ?? now;
      return now - ts > maxAgeMs;
    });
    if (toRemove.length === 0) return;
    for (const rec of toRemove) {
      const idx = this.store.buyers.payment.findIndex(
        (p) => p.transactionId === rec.transactionId,
      );
      if (idx !== -1) this.store.buyers.payment.splice(idx, 1);
      tsMap.delete(rec.transactionId);
    }
    this.fillPaymentFromWaiting();
    this.sortQueues();
  }

  private cleanupPaymentTimestamp(transactionId: string): void {
    this.paymentTimestamps.delete(transactionId);
  }

  private fillPaymentFromWaiting(): void {
    if (!this.store.sale) return;
    const capacity = this.store.sale.productQty;
    while (
      this.store.buyers.payment.length < capacity &&
      this.store.buyers.waiting.length > 0
    ) {
      const rec = this.store.buyers.waiting.shift();
      if (!rec) break;
      this.store.buyers.payment.push(rec);
      this.paymentTimestamps.set(rec.transactionId, Date.now());
      void this.emitKafkaSwitch(rec.transactionId, rec.buyerName, rec.saleId);
    }
  }

  private async emitKafka(
    transactionId: string,
    buyerName: string,
    saleId: string,
  ): Promise<void> {
    if (!this.kafkaEnabled) return;
    try {
      const producer = await this.getProducer();
      await producer.send({
        topic: this.kafkaTopic,
        messages: [
          {
            key: transactionId,
            value: JSON.stringify({
              transactionId,
              buyerName,
              saleId,
              type: "paid",
            }),
          },
        ],
      });
    } catch (err) {
      this.logger.error(
        `Failed to emit Kafka message: ${(err as Error).message}`,
      );
    }
  }

  private async emitKafkaSwitch(
    transactionId: string,
    buyerName: string,
    saleId: string,
  ): Promise<void> {
    if (!this.kafkaEnabled) return;
    try {
      const producer = await this.getProducer();
      await producer.send({
        topic: this.kafkaTopic,
        messages: [
          {
            key: transactionId,
            value: JSON.stringify({
              transactionId,
              buyerName,
              saleId,
              type: "switch",
            }),
          },
        ],
      });
    } catch (err) {
      this.logger.error(
        `Failed to emit Kafka switch: ${(err as Error).message}`,
      );
    }
  }

  private sortQueues(): void {
    const byTxId = (
      a: { transactionId: string },
      b: { transactionId: string },
    ) => a.transactionId.localeCompare(b.transactionId);
    this.store.buyers.payment.sort(byTxId);
    this.store.buyers.waiting.sort(byTxId);
    this.store.buyers.success.sort(byTxId);
  }
}
