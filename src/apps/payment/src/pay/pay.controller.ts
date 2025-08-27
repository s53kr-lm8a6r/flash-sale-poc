import { Body, Controller, HttpCode, Post } from "@nestjs/common";

import { PayService } from "./pay.service";
import type { PayRequestDto, PayResponseDto } from "./types";
@Controller()
export class PayController {
  constructor(private readonly payService: PayService) {}

  @Post("pay")
  @HttpCode(200)
  pay(@Body() body: PayRequestDto): Promise<PayResponseDto> {
    return this.payService.pay(body);
  }
}
