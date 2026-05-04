"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthMember } from "./types";

interface AuthState {
  token: string | null;
  expiresAt: string | null;
  member: AuthMember | null;
  setSession: (token: string, expiresAt: string, member: AuthMember) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      expiresAt: null,
      member: null,
      setSession: (token, expiresAt, member) => set({ token, expiresAt, member }),
      clear: () => set({ token: null, expiresAt: null, member: null }),
    }),
    { name: "msa-shop-auth" },
  ),
);

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().token;
}
