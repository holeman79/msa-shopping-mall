"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useKakaoLogin } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api/client";

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<KakaoCallbackFallback />}>
      <KakaoCallbackInner />
    </Suspense>
  );
}

function KakaoCallbackFallback() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>카카오 로그인</CardTitle>
            <CardDescription>준비 중...</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

function KakaoCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const error = params.get("error");
  const kakaoLogin = useKakaoLogin();

  // React Strict Mode에서 effect가 두 번 실행되면 같은 code로 두 번 교환 시도 → 두 번째 실패. 한 번만 실행.
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    if (!code) return;
    triggered.current = true;
    kakaoLogin.mutate(code, {
      onSuccess: () => router.replace("/"),
    });
  }, [code, kakaoLogin, router]);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>카카오 로그인</CardTitle>
            <CardDescription>카카오 계정으로 인증을 진행 중입니다...</CardDescription>
          </div>
        </CardHeader>

        {error && (
          <p className="text-sm text-(--color-danger)">
            카카오 인증이 취소되었거나 거부되었습니다: {error}
          </p>
        )}

        {!code && !error && (
          <p className="text-sm text-(--color-muted-foreground)">code 파라미터가 없습니다.</p>
        )}

        {kakaoLogin.error && (
          <p className="text-sm text-(--color-danger)">{describeError(kakaoLogin.error)}</p>
        )}

        {(error || kakaoLogin.error) && (
          <p className="mt-4 text-sm">
            <Link href="/login" className="text-(--color-primary) hover:underline">
              로그인 화면으로 돌아가기
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}

function describeError(err: Error): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string } | null;
    return body?.message ?? `${err.status} ${err.statusText}`;
  }
  return err.message;
}
