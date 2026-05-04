import { api } from "@/lib/api/client";
import { API_CONFIG } from "@/lib/api/config";
import { MOCK_ORDERS } from "./mock";
import type { Order } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const orderApi = {
  list: async (): Promise<Order[]> => {
    if (API_CONFIG.useMock) {
      await sleep(150);
      return MOCK_ORDERS;
    }
    return api.get<Order[]>("/orders");
  },
  get: async (id: string): Promise<Order> => {
    if (API_CONFIG.useMock) {
      await sleep(120);
      const found = MOCK_ORDERS.find((o) => o.id === id);
      if (!found) throw new Error(`Order ${id} not found`);
      return found;
    }
    return api.get<Order>(`/orders/${id}`);
  },
};
