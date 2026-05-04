import { getAuthToken } from "@/features/auth/store";
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

async function request<T>(path: string, init: RequestInitWithJson = {}): Promise<T> {
  const { json, query, headers, ...rest } = init;
  const url = new URL(`${API_CONFIG.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const token = getAuthToken();
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

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
