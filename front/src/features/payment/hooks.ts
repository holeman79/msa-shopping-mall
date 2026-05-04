import { useQuery } from "@tanstack/react-query";
import { paymentApi } from "./api";

export const paymentKeys = {
  all: ["payments"] as const,
  detail: (id: string) => ["payments", id] as const,
};

export function usePayments() {
  return useQuery({ queryKey: paymentKeys.all, queryFn: paymentApi.list });
}

export function usePayment(id: string) {
  return useQuery({ queryKey: paymentKeys.detail(id), queryFn: () => paymentApi.get(id) });
}
