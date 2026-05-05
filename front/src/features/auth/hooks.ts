"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "./api";
import { useAuthStore } from "./store";
import type { LoginPayload, LoginResult, SignupPayload } from "./types";

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation<LoginResult, Error, SignupPayload>({
    mutationFn: (payload) => authApi.signup(payload),
    onSuccess: (data) => setSession(data),
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation<LoginResult, Error, LoginPayload>({
    mutationFn: (payload) => authApi.login(payload),
    onSuccess: (data) => setSession(data),
  });
}

export function useKakaoLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation<LoginResult, Error, string>({
    mutationFn: (code) => authApi.kakao.login(code),
    onSuccess: (data) => setSession(data),
  });
}

export async function startKakaoOAuthRedirect(): Promise<void> {
  const { url } = await authApi.kakao.authorizeUrl();
  window.location.href = url;
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  return async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // 토큰이 이미 만료/삭제되었어도 클라이언트는 정리하고 진행.
      }
    }
    clear();
  };
}
