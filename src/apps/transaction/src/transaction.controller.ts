import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from "@nestjs/common";

import { DateTime } from "luxon";
import { PaymentQueueService } from "./queue.service";
import { TransactionStore } from "./store";

@Controller()
export class TransactionController {
  constructor(
    private readonly queue: PaymentQueueService,
    private readonly store: TransactionStore,
  ) {}

  @Post("buy")
  @HttpCode(200)
  buy(@Body("buyerName") buyerName: string): {
    transactionId: string;
    state: "payment" | "waiting";
  } {
    const sale = this.store.sale;
    if (!sale) {
      throw new BadRequestException("Sale not initialized");
    }
    const saleId = sale.id;
    const now = DateTime.utc();
    const starts = DateTime.fromISO(sale.saleStart).toUTC();
    const ends = DateTime.fromISO(sale.saleEnd).toUTC();
    if (sale.productQty <= 0) {
      this.store.buyers.waiting = [];
      throw new BadRequestException("Sale is sold out");
    }
    if (now < starts || now > ends) {
      throw new BadRequestException("Sale is not active");
    }
    const existsIn = [
      ...this.store.buyers.success,
      ...this.store.buyers.payment,
      ...this.store.buyers.waiting,
    ].some((b) => b.saleId === saleId && b.buyerName === buyerName);
    if (existsIn) {
      throw new BadRequestException(
        "Buyer already has a transaction for this sale",
      );
    }
    return this.queue.buy(buyerName);
  }

  @Post("paid")
  @HttpCode(200)
  async paid(
    @Body("transactionId") transactionId: string,
  ): Promise<{ success: boolean }> {
    if (!transactionId || transactionId.trim().length === 0) {
      throw new BadRequestException("transactionId is required");
    }
    const inPayment = this.store.buyers.payment.some(
      (p) => p.transactionId === transactionId,
    );
    if (!inPayment) {
      throw new BadRequestException("Transaction not in payment queue");
    }
    const success = await this.queue.paid(transactionId);
    if (!success) {
      throw new BadRequestException("Payment not processed");
    }
    return { success };
  }
}
