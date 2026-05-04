import { useQuery } from "@tanstack/react-query";
import { orderApi } from "./api";

export const orderKeys = {
  all: ["orders"] as const,
  detail: (id: string) => ["orders", id] as const,
};

export function useOrders() {
  return useQuery({ queryKey: orderKeys.all, queryFn: orderApi.list });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: orderKeys.detail(id), queryFn: () => orderApi.get(id) });
}
