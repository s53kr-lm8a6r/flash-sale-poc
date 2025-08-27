import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PaymentQueueService } from "./queue.service";
import { TransactionStore } from "./store";
import { SyncService } from "./sync.service";
import { TransactionController } from "./transaction.controller";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [TransactionController],
  providers: [TransactionStore, SyncService, PaymentQueueService],
})
export class AppModule {}
