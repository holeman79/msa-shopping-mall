import { getAuthToken, getRefreshToken, useAuthStore } from "@/features/auth/store";
import type { LoginResult } from "@/features/auth/types";
import { API_CONFIG } from "./config";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`${status} ${statusText}`);
    this.name = "ApiError";
  }
}

type RequestInitWithJson = Omit<RequestInit, "body"> & {
  json?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

// 동시에 여러 요청이 401을 받아도 refresh는 한 번만 일어나도록 하나의 promise를 공유.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        useAuthStore.getState().clear();
        return null;
      }
      const data = (await res.json()) as LoginResult;
      useAuthStore.getState().setSession(data);
      return data.token;
    } catch {
      useAuthStore.getState().clear();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

function isAuthPath(path: string): boolean {
  return path.startsWith("/auth/") || path.startsWith("auth/");
}

async function fetchOnce(url: URL, init: RequestInit, token: string | null): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((init.headers as Record<string, string> | undefined) ?? {}),
    },
  });
}

async function request<T>(path: string, init: RequestInitWithJson = {}): Promise<T> {
  const { json, query, headers, ...rest } = init;
  const url = new URL(`${API_CONFIG.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const baseInit: RequestInit = {
    ...rest,
    headers: headers as HeadersInit | undefined,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  };

  let token = getAuthToken();
  let res = await fetchOnce(url, baseInit, token);

  // 401 + refresh 가능한 상황이면 한 번 갱신 후 재시도. /auth/* 자체는 재시도 대상 아님.
  if (res.status === 401 && !isAuthPath(path) && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
      res = await fetchOnce(url, baseInit, token);
    }
  }

  if (!res.ok) {
    const body = await safeBody(res);
    throw new ApiError(res.status, res.statusText, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function safeBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return await res.text().catch(() => null);
  }
}

export const api = {
  get: <T>(path: string, init?: Omit<RequestInitWithJson, "method" | "json">) =>
    request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, json?: unknown, init?: Omit<RequestInitWithJson, "method">) =>
    request<T>(path, { ...init, method: "POST", json }),
  put: <T>(path: string, json?: unknown, init?: Omit<RequestInitWithJson, "method">) =>
    request<T>(path, { ...init, method: "PUT", json }),
  patch: <T>(path: string, json?: unknown, init?: Omit<RequestInitWithJson, "method">) =>
    request<T>(path, { ...init, method: "PATCH", json }),
  delete: <T>(path: string, init?: Omit<RequestInitWithJson, "method" | "json">) =>
    request<T>(path, { ...init, method: "DELETE" }),
};
