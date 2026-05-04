export type ProductStatus = "ON_SALE" | "SOLD_OUT" | "HIDDEN";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
  category: string;
  imageUrl: string;
  createdAt: string;
}
