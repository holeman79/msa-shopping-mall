import { api } from "@/lib/api/client";
import { API_CONFIG } from "@/lib/api/config";
import { MOCK_PAYMENTS } from "./mock";
import type { Payment } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const paymentApi = {
  list: async (): Promise<Payment[]> => {
    if (API_CONFIG.useMock) {
      await sleep(150);
      return MOCK_PAYMENTS;
    }
    return api.get<Payment[]>("/payments");
  },
  get: async (id: string): Promise<Payment> => {
    if (API_CONFIG.useMock) {
      await sleep(120);
      const found = MOCK_PAYMENTS.find((p) => p.id === id);
      if (!found) throw new Error(`Payment ${id} not found`);
      return found;
    }
    return api.get<Payment>(`/payments/${id}`);
  },
};
