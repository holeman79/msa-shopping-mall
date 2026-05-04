"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "./api";
import { useAuthStore } from "./store";
import type { LoginPayload, LoginResult, SignupPayload } from "./types";

export function useSignup() {
  return useMutation({ mutationFn: (payload: SignupPayload) => authApi.signup(payload) });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation<LoginResult, Error, LoginPayload>({
    mutationFn: (payload) => authApi.login(payload),
    onSuccess: (data) => setSession(data.token, data.expiresAt, data.member),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  return clear;
}
