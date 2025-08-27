import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

import type { PayRequestDto, PayResponseDto } from "./types";
@Injectable()
export class PayService {
  private readonly logger = new Logger(PayService.name);

  constructor(private readonly configService: ConfigService) {}

  async pay(request: PayRequestDto): Promise<PayResponseDto> {
    this.logger.log(
      `Processing payment tx=${request.transactionId} qty=${request.quantity}`,
    );

    if (!request.transactionId || request.quantity <= 0) {
      return { success: false };
    }

    try {
      const callbackUrl =
        this.configService.get<string>("PAY_CALLBACK_URL") ??
        "http://localhost:3099/paid";
      const res = await axios.post(callbackUrl, {
        transactionId: request.transactionId,
      });
      if (res.status < 200 || res.status >= 300) {
        this.logger.error(`Callback failed with status ${res.status}`);
        return { success: false };
      }
    } catch (err) {
      const message =
        (axios.isAxiosError(err) && err.message) || (err as Error).message;
      this.logger.error(`Callback error: ${message}`);
      return { success: false };
    }

    return { success: true };
  }
}
