import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DateTime } from "luxon";

import { NotificationsGateway } from "../notifications.gateway";
import { SalesService } from "./sales.service";
@Injectable()
export class SalesScheduler implements OnModuleInit {
  private readonly logger = new Logger(SalesScheduler.name);

  constructor(
    private readonly salesService: SalesService,
    private readonly ws: NotificationsGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    const sales = this.salesService.getAllSales();
    for (const sale of sales) {
      const start = DateTime.fromISO(sale.saleStart).toUTC();
      const end = DateTime.fromISO(sale.saleEnd).toUTC();
      const now = DateTime.utc();

      if (start > now) {
        const ms = start.diff(now).toMillis();
        setTimeout(() => {
          this.ws.emitSaleStarted({
            saleId: sale.id,
            startsAt: sale.saleStart,
          });
          this.ws.emitSaleEvent({
            saleId: sale.id,
            event: "start",
            at: sale.saleStart,
          });
        }, ms);
        this.logger.log(`Scheduled sale_started for ${sale.id} in ${ms}ms`);
      } else {
        this.ws.emitSaleStarted({ saleId: sale.id, startsAt: sale.saleStart });
        this.ws.emitSaleEvent({
          saleId: sale.id,
          event: "start",
          at: sale.saleStart,
        });
      }

      if (end > now) {
        const ms = end.diff(now).toMillis();
        setTimeout(() => {
          this.ws.emitSaleEnded({ saleId: sale.id, endsAt: sale.saleEnd });
          this.ws.emitSaleEvent({
            saleId: sale.id,
            event: "end",
            at: sale.saleEnd,
          });
        }, ms);
        this.logger.log(`Scheduled sale_ended for ${sale.id} in ${ms}ms`);
      } else {
        this.ws.emitSaleEnded({ saleId: sale.id, endsAt: sale.saleEnd });
        this.ws.emitSaleEvent({
          saleId: sale.id,
          event: "end",
          at: sale.saleEnd,
        });
      }
    }
  }
}
