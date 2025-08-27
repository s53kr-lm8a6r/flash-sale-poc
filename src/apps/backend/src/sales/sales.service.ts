import { Injectable, NotFoundException } from "@nestjs/common";

import type { Buyer, Sale } from "common";
import { InMemorySalesRepository } from "./inmemory.repository";
@Injectable()
export class SalesService {
  constructor(private readonly repository: InMemorySalesRepository) {}

  getAllSales(): Sale[] {
    return this.repository.getAllSales();
  }

  getSaleById(id: string): Sale {
    const sale = this.repository.getSaleById(id);
    if (!sale) {
      throw new NotFoundException(`Sale not found: ${id}`);
    }
    return sale;
  }

  buyerExistsById(buyerId: string, saleId: string): boolean {
    return this.repository.buyerExistsById(buyerId, saleId);
  }

  getBuyersBySaleId(saleId: string): Buyer[] {
    this.getSaleById(saleId);
    return this.repository.getBuyersBySaleId(saleId);
  }

  saleQty(saleId: string): number {
    const sale = this.getSaleById(saleId);
    return sale.productQty;
  }

  buyerExistsByName(saleId: string, buyerName: string): boolean {
    this.getSaleById(saleId);
    return this.repository.buyerExistsByName(saleId, buyerName);
  }
}
