export type MemberRole = "CUSTOMER" | "SELLER" | "ADMIN";
export type MemberStatus = "ACTIVE" | "DORMANT" | "WITHDRAWN";
export type SellerApprovalStatus = "NOT_APPLICABLE" | "PENDING" | "APPROVED" | "REJECTED";
export type SignupRole = Exclude<MemberRole, "ADMIN">;

export interface AuthMember {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: MemberRole;
  status: MemberStatus;
  sellerApprovalStatus: SellerApprovalStatus;
  joinedAt: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: SignupRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  member: AuthMember;
}
