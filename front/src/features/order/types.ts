export type OrderStatus = "PENDING" | "PAID" | "SHIPPING" | "DELIVERED" | "CANCELLED";

export interface OrderLine {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  memberId: number;
  memberName: string;
  status: OrderStatus;
  totalAmount: number;
  lines: OrderLine[];
  shippingAddress: string;
  orderedAt: string;
}
