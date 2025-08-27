import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

import type { Buyer, Sale } from "common";
import { TransactionStore } from "./store";

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly store: TransactionStore,
  ) {}

  async onModuleInit(): Promise<void> {
    const saleId = this.configService.get<string>("SALE_ID");
    const backendBaseUrl = this.configService.get<string>("BACKEND_BASE_URL");
    const retryMs =
      Number(this.configService.get<string>("SYNC_RETRY_MS")) || 2000;

    if (!saleId || !backendBaseUrl) {
      this.logger.warn(
        "SALE_ID or BACKEND_BASE_URL not set; skipping initial sync.",
      );
      return;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const [saleRes, buyersRes] = await Promise.all([
          axios.get<Sale>(`${backendBaseUrl}/sales/${saleId}`),
          axios.get<Buyer[]>(`${backendBaseUrl}/sales/${saleId}/buyers`),
        ]);

        this.store.clearQueues();
        this.store.setSale(saleRes.data);
        this.store.replaceSuccessFromBuyers(buyersRes.data);

        this.logger.log(
          `Synced sale ${saleId} with ${buyersRes.data.length} buyers into success queue.`,
        );
        break;
      } catch (err) {
        const message =
          (axios.isAxiosError(err) && err.message) || (err as Error).message;
        this.logger.error(
          `Initial sync failed, retrying in ${retryMs}ms: ${message}`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryMs));
      }
    }
  }
}
