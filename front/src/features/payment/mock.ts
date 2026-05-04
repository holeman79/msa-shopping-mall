import type { Payment } from "./types";

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "PAY-2026-0001",
    orderId: "ORD-2026-0001",
    method: "CARD",
    status: "APPROVED",
    amount: 1_449_000,
    approvedAt: "2026-04-28T10:16:30Z",
    pgProvider: "Toss Payments",
  },
  {
    id: "PAY-2026-0002",
    orderId: "ORD-2026-0002",
    method: "CARD",
    status: "APPROVED",
    amount: 64_000,
    approvedAt: "2026-05-02T08:43:10Z",
    pgProvider: "Toss Payments",
  },
  {
    id: "PAY-2026-0003",
    orderId: "ORD-2026-0003",
    method: "TRANSFER",
    status: "APPROVED",
    amount: 2_490_000,
    approvedAt: "2026-05-03T19:01:22Z",
    pgProvider: "KG Inicis",
  },
  {
    id: "PAY-2026-0004",
    orderId: "ORD-2026-0004",
    method: "VIRTUAL_ACCOUNT",
    status: "READY",
    amount: 359_000,
    approvedAt: null,
    pgProvider: "KCP",
  },
  {
    id: "PAY-2026-0005",
    orderId: "ORD-2026-0005",
    method: "CARD",
    status: "REFUNDED",
    amount: 219_000,
    approvedAt: "2026-04-19T13:31:00Z",
    pgProvider: "Toss Payments",
  },
];
