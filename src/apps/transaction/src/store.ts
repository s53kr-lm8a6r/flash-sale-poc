import { Injectable } from "@nestjs/common";
import { ObjectId } from "bson";
import type { Buyer, Sale } from "common";

@Injectable()
export class TransactionStore {
  sale: Sale | null = null;
  buyers = {
    success: [] as Array<{
      transactionId: string;
      buyerName: string;
      saleId: string;
    }>,
    payment: [] as Array<{
      transactionId: string;
      buyerName: string;
      saleId: string;
    }>,
    waiting: [] as Array<{
      transactionId: string;
      buyerName: string;
      saleId: string;
    }>,
  };

  setSale(sale: Sale): void {
    this.sale = sale;
  }

  replaceSuccessFromBuyers(buyers: Buyer[]): void {
    this.buyers.success = buyers.map((b) => ({
      transactionId: new ObjectId().toHexString(),
      buyerName: b.buyerName,
      saleId: b.saleId,
    }));
  }

  clearQueues(): void {
    this.buyers.success = [];
    this.buyers.payment = [];
    this.buyers.waiting = [];
  }
}
