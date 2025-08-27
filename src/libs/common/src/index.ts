export interface Sale {
  id: string;
  productName: string;
  productQty: number;
  saleStart: string;
  saleEnd: string;
}

export interface Buyer {
  id: string;
  saleId: string;
  buyerName: string;
}
