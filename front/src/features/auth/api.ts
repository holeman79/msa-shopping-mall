import { api } from "@/lib/api/client";
import type { AuthMember, LoginPayload, LoginResult, SignupPayload } from "./types";

export const authApi = {
  signup: (payload: SignupPayload): Promise<LoginResult> => api.post<LoginResult>("/auth/signup", payload),
  login: (payload: LoginPayload): Promise<LoginResult> => api.post<LoginResult>("/auth/login", payload),
  refresh: (refreshToken: string): Promise<LoginResult> =>
    api.post<LoginResult>("/auth/refresh", { refreshToken }),
  logout: (refreshToken: string): Promise<void> => api.post<void>("/auth/logout", { refreshToken }),
  me: (): Promise<AuthMember> => api.get<AuthMember>("/members/me"),
};
