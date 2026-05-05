"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { KakaoLoginButton } from "@/components/auth/kakao-login-button";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => router.push("/") },
    );
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>로그인</CardTitle>
            <CardDescription>MSA 쇼핑몰 콘솔에 로그인합니다.</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="이메일"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            id="password"
            type="password"
            label="비밀번호"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {login.error && (
            <p className="text-sm text-(--color-danger)">{describeError(login.error)}</p>
          )}
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-(--color-muted-foreground)">
          <div className="h-px flex-1 bg-(--color-border)" />
          <span>또는</span>
          <div className="h-px flex-1 bg-(--color-border)" />
        </div>

        <KakaoLoginButton label="카카오로 로그인" />

        <p className="mt-6 text-center text-sm text-(--color-muted-foreground)">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-(--color-primary) hover:underline">
            회원가입
          </Link>
        </p>
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
