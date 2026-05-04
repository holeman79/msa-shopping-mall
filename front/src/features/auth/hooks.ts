"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "./api";
import { useAuthStore } from "./store";
import type { LoginPayload, LoginResult, SignupPayload } from "./types";

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation<LoginResult, Error, SignupPayload>({
    mutationFn: (payload) => authApi.signup(payload),
    onSuccess: (data) => setSession(data.token, data.expiresAt, data.member),
  });
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
