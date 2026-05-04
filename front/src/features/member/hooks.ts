import { useQuery } from "@tanstack/react-query";
import { memberApi } from "./api";

export const memberKeys = {
  all: ["members"] as const,
  detail: (id: number) => ["members", id] as const,
};

export function useMembers() {
  return useQuery({ queryKey: memberKeys.all, queryFn: memberApi.list });
}

export function useMember(id: number) {
  return useQuery({ queryKey: memberKeys.detail(id), queryFn: () => memberApi.get(id) });
}
