import { Injectable } from "@nestjs/common";
import { ObjectId } from "bson";
import type { Buyer, Sale } from "common";
import { DateTime } from "luxon";
@Injectable()
export class InMemorySalesRepository {
  private readonly sales: Map<string, Sale> = new Map();
  private readonly buyers: Map<string, Buyer> = new Map();

  constructor() {
    const saleId = "68ae5aa6859554c0d409a3f8";
    const seedSales: Sale[] = [
      {
        id: saleId,
        productName: "Wireless Mouse",
        productQty: 1_500_000,
        saleStart: DateTime.now().minus({ minutes: 5 }).toUTC().toISO(),
        saleEnd: DateTime.now().plus({ minutes: 10 }).toUTC().toISO(),
      },
    ];
    const seedBuyers: Buyer[] = [
      { id: new ObjectId().toHexString(), saleId, buyerName: "Alice" },
      { id: new ObjectId().toHexString(), saleId, buyerName: "Bob" },
    ];

    for (const sale of seedSales) this.sales.set(sale.id, sale);
    for (const buyer of seedBuyers) this.buyers.set(buyer.id, buyer);
  }

  getAllSales(): Sale[] {
    return [...this.sales.values()];
  }

  getSaleById(saleId: string): Sale | undefined {
    return this.sales.get(saleId);
  }

  buyerExistsById(buyerId: string, saleId: string): boolean {
    const buyer = this.buyers.get(buyerId);
    return buyer !== undefined && buyer.saleId === saleId;
  }

  getBuyersBySaleId(saleId: string): Buyer[] {
    const result: Buyer[] = [];
    for (const buyer of this.buyers.values()) {
      if (buyer.saleId === saleId) result.push(buyer);
    }
    return result;
  }

  buyerExistsByName(saleId: string, buyerName: string): boolean {
    for (const buyer of this.buyers.values()) {
      if (buyer.saleId === saleId && buyer.buyerName === buyerName) return true;
    }
    return false;
  }

  addSuccessBuyer(entry: {
    transactionId: string;
    saleId: string;
    buyerName: string;
  }): void {
    for (const existing of this.buyers.values()) {
      if (
        existing.saleId === entry.saleId &&
        existing.buyerName === entry.buyerName
      ) {
        return;
      }
    }
    const buyer: Buyer = {
      id: new ObjectId().toHexString(),
      saleId: entry.saleId,
      buyerName: entry.buyerName,
    };
    this.buyers.set(buyer.id, buyer);
  }

  decrementSaleQty(saleId: string): Sale | undefined {
    const sale = this.sales.get(saleId);
    if (!sale) return undefined;
    if (sale.productQty > 0) {
      sale.productQty -= 1;
      this.sales.set(saleId, sale);
    }
    return sale;
  }
}
