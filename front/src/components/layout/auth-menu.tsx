"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store";
import type { MemberRole } from "@/features/auth/types";

const ROLE_LABEL: Record<MemberRole, string> = {
  CUSTOMER: "일반",
  SELLER: "판매자",
  ADMIN: "관리자",
};

const ROLE_TONE: Record<MemberRole, "default" | "info" | "danger"> = {
  CUSTOMER: "default",
  SELLER: "info",
  ADMIN: "danger",
};

export function AuthMenu() {
  const router = useRouter();
  const member = useAuthStore((s) => s.member);
  const clear = useAuthStore((s) => s.clear);

  // Persist hydrates client-side only — avoid hydration mismatch.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return <div className="h-8 w-32" aria-hidden />;

  if (!member) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button size="sm" variant="ghost">
            로그인
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">회원가입</Button>
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    clear();
    router.push("/");
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Badge tone={ROLE_TONE[member.role]}>{ROLE_LABEL[member.role]}</Badge>
        <span className="font-medium">{member.name}</span>
      </div>
      <Button size="sm" variant="ghost" onClick={handleLogout}>
        로그아웃
      </Button>
    </div>
  );
}
