import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
} from "@nestjs/common";

import type { Buyer, Sale } from "common";
import { SalesService } from "./sales.service";
@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  getAllSales(): Sale[] {
    return this.salesService.getAllSales();
  }

  @Get(":id")
  getSaleById(@Param("id") id: string): Sale {
    return this.salesService.getSaleById(id);
  }

  @Get(":id/buyers")
  getBuyersBySaleId(@Param("id") id: string): Buyer[] {
    return this.salesService.getBuyersBySaleId(id);
  }

  @Post(":id/eligible")
  @HttpCode(200)
  checkEligible(
    @Param("id") id: string,
    @Body("buyerName") buyerName: string
  ): void {
    const qty = this.salesService.saleQty(id);
    if (qty <= 0) {
      throw new BadRequestException("Sale is sold out");
    }
    const exists = this.salesService.buyerExistsByName(id, buyerName);
    if (exists) {
      throw new BadRequestException(
        "You have already participated in this sale"
      );
    }
  }
}
