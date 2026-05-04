import { api } from "@/lib/api/client";
import { API_CONFIG } from "@/lib/api/config";
import { MOCK_PRODUCTS } from "./mock";
import type { Product } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const productApi = {
  list: async (): Promise<Product[]> => {
    if (API_CONFIG.useMock) {
      await sleep(150);
      return MOCK_PRODUCTS;
    }
    return api.get<Product[]>("/products");
  },
  get: async (id: number): Promise<Product> => {
    if (API_CONFIG.useMock) {
      await sleep(120);
      const found = MOCK_PRODUCTS.find((p) => p.id === id);
      if (!found) throw new Error(`Product ${id} not found`);
      return found;
    }
    return api.get<Product>(`/products/${id}`);
  },
};
