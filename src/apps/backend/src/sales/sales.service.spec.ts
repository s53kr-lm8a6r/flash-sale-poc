import { InMemorySalesRepository } from "./inmemory.repository";
import { SalesService } from "./sales.service";

describe("SalesService", () => {
  let service: SalesService;

  beforeEach(() => {
    service = new SalesService(new InMemorySalesRepository());
  });

  it("returns sales", () => {
    const sales = service.getAllSales();
    expect(Array.isArray(sales)).toBe(true);
    expect(sales.length).toBeGreaterThan(0);
  });

  it("resolves buyers by sale id and checks existing name", () => {
    const sale = service.getAllSales()[0];
    const buyers = service.getBuyersBySaleId(sale.id);
    expect(Array.isArray(buyers)).toBe(true);
    const exists = service.buyerExistsByName(
      sale.id,
      buyers[0]?.buyerName ?? "Alice",
    );
    expect(exists).toBe(true);
  });

  it("returns sale quantity", () => {
    const sale = service.getAllSales()[0];
    expect(service.saleQty(sale.id)).toBeGreaterThanOrEqual(0);
  });
});
