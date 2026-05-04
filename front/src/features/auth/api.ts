import { api } from "@/lib/api/client";
import type { AuthMember, LoginPayload, LoginResult, SignupPayload } from "./types";

export const authApi = {
  signup: (payload: SignupPayload): Promise<AuthMember> => api.post<AuthMember>("/members/signup", payload),
  login: (payload: LoginPayload): Promise<LoginResult> => api.post<LoginResult>("/members/login", payload),
  me: (): Promise<AuthMember> => api.get<AuthMember>("/members/me"),
};
