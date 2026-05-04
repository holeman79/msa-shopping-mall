"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthMember, LoginResult } from "./types";

interface AuthState {
  token: string | null;
  expiresAt: string | null;
  refreshToken: string | null;
  refreshExpiresAt: string | null;
  member: AuthMember | null;
  setSession: (result: LoginResult) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      expiresAt: null,
      refreshToken: null,
      refreshExpiresAt: null,
      member: null,
      setSession: (result) =>
        set({
          token: result.token,
          expiresAt: result.expiresAt,
          refreshToken: result.refreshToken,
          refreshExpiresAt: result.refreshExpiresAt,
          member: result.member,
        }),
      clear: () =>
        set({
          token: null,
          expiresAt: null,
          refreshToken: null,
          refreshExpiresAt: null,
          member: null,
        }),
    }),
    { name: "msa-shop-auth" },
  ),
);

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().token;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().refreshToken;
}
