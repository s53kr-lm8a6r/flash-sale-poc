import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KafkaConsumerService } from "./kafka-consumer.service";
import { NotificationsGateway } from "./notifications.gateway";
import { SalesModule } from "./sales/sales.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SalesModule],
  controllers: [],
  providers: [NotificationsGateway, KafkaConsumerService],
})
export class AppModule {}
