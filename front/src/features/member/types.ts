export type MemberGrade = "BASIC" | "SILVER" | "GOLD" | "VIP";
export type MemberStatus = "ACTIVE" | "DORMANT" | "WITHDRAWN";

export interface Member {
  id: number;
  email: string;
  name: string;
  phone: string;
  grade: MemberGrade;
  status: MemberStatus;
  totalOrderAmount: number;
  joinedAt: string;
}
