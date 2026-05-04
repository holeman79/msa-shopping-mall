export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api",
  useMock: process.env.NEXT_PUBLIC_USE_MOCK !== "false",
} as const;
