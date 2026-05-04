import { useQuery } from "@tanstack/react-query";
import { productApi } from "./api";

export const productKeys = {
  all: ["products"] as const,
  detail: (id: number) => ["products", id] as const,
};

export function useProducts() {
  return useQuery({ queryKey: productKeys.all, queryFn: productApi.list });
}

export function useProduct(id: number) {
  return useQuery({ queryKey: productKeys.detail(id), queryFn: () => productApi.get(id) });
}
