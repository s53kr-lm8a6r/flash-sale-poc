import { Module } from "@nestjs/common";

import { NotificationsGateway } from "../notifications.gateway";
import { InMemorySalesRepository } from "./inmemory.repository";
import { SalesController } from "./sales.controller";
import { SalesScheduler } from "./sales.scheduler";
import { SalesService } from "./sales.service";

@Module({
  controllers: [SalesController],
  providers: [
    InMemorySalesRepository,
    SalesService,
    SalesScheduler,
    NotificationsGateway,
  ],
  exports: [SalesService, InMemorySalesRepository, NotificationsGateway],
})
export class SalesModule {}
