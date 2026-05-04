export type PaymentMethod = "CARD" | "TRANSFER" | "VIRTUAL_ACCOUNT" | "POINT";
export type PaymentStatus = "READY" | "APPROVED" | "FAILED" | "CANCELLED" | "REFUNDED";

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  approvedAt: string | null;
  pgProvider: string;
}
