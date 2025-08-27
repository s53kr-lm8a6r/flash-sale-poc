import { BadRequestException } from "@nestjs/common";
import { PaymentQueueService } from "./queue.service";
import { TransactionStore } from "./store";
import { TransactionController } from "./transaction.controller";

function createController() {
  const store = new TransactionStore();
  const queue = new PaymentQueueService(
    store as any,
    { get: () => undefined } as any
  );
  const controller = new TransactionController(queue as any, store);
  return { controller, store };
}

describe("TransactionController", () => {
  it("rejects buy when sold out and clears waiting", () => {
    const { controller, store } = createController();
    store.sale = {
      id: "s1",
      productName: "X",
      productQty: 0,
      saleStart: new Date().toISOString(),
      saleEnd: new Date(Date.now() + 60_000).toISOString(),
    };
    expect(() => controller.buy("john")).toThrow(BadRequestException);
    expect(store.buyers.waiting.length).toBe(0);
  });

  it("rejects paid when not in payment queue", async () => {
    const { controller } = createController();
    await expect(controller.paid("unknown")).rejects.toThrow(
      BadRequestException
    );
  });
});
