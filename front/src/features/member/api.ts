import { api } from "@/lib/api/client";
import { API_CONFIG } from "@/lib/api/config";
import { MOCK_MEMBERS } from "./mock";
import type { Member } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const memberApi = {
  list: async (): Promise<Member[]> => {
    if (API_CONFIG.useMock) {
      await sleep(150);
      return MOCK_MEMBERS;
    }
    return api.get<Member[]>("/members");
  },
  get: async (id: number): Promise<Member> => {
    if (API_CONFIG.useMock) {
      await sleep(120);
      const found = MOCK_MEMBERS.find((m) => m.id === id);
      if (!found) throw new Error(`Member ${id} not found`);
      return found;
    }
    return api.get<Member>(`/members/${id}`);
  },
};
