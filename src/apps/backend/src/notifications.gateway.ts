import { Logger } from "@nestjs/common";
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";

const wsCorsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : "*";
@WebSocketGateway({ cors: { origin: wsCorsOrigin } })
export class NotificationsGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  afterInit(): void {
    this.logger.log("WebSocket gateway initialized");
  }

  emitSaleUpdate(payload: {
    saleId: string;
    remainingQty: number;
    buyerName: string;
  }): void {
    this.server.emit("sale_update", payload);
  }

  emitSaleStarted(payload: { saleId: string; startsAt: string }): void {
    this.server.emit("sale_started", payload);
  }

  emitSaleEnded(payload: { saleId: string; endsAt: string }): void {
    this.server.emit("sale_ended", payload);
  }

  emitSaleEvent(payload: {
    saleId: string;
    event: "start" | "end";
    at: string;
  }): void {
    this.server.emit("sale_event", payload);
  }

  emitQueueSwitch(payload: {
    transactionId: string;
    buyerName: string;
    saleId: string;
  }): void {
    this.server.emit("queue_switch", payload);
  }
}
