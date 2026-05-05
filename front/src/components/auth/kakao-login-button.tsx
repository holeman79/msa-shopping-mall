"use client";

import { useState } from "react";
import { startKakaoOAuthRedirect } from "@/features/auth/hooks";
import { cn } from "@/lib/cn";

export function KakaoLoginButton({ label = "카카오로 시작하기" }: { label?: string }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await startKakaoOAuthRedirect();
    } catch {
      setBusy(false);
    }
    // 성공 시 페이지가 카카오로 리다이렉트되므로 setBusy(false) 호출 필요 없음.
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={cn(
        "flex h-10 w-full items-center justify-center gap-2 rounded-md font-medium",
        "bg-[#FEE500] text-[#191919] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <span aria-hidden className="text-lg leading-none">💬</span>
      {busy ? "이동 중..." : label}
    </button>
  );
}
