"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useSignup } from "@/features/auth/hooks";
import type { SignupRole } from "@/features/auth/types";
import { ApiError } from "@/lib/api/client";

const ROLES: Array<{ value: SignupRole; label: string; description: string }> = [
  { value: "CUSTOMER", label: "일반 회원", description: "상품 구매와 주문을 위해 가입" },
  { value: "SELLER", label: "판매자", description: "상품을 등록하고 판매" },
];

export default function SignupPage() {
  const router = useRouter();
  const signup = useSignup();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<SignupRole>("CUSTOMER");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    signup.mutate(
      { email, password, name, phone: phone || undefined, role },
      { onSuccess: () => router.push("/login?signup=ok") },
    );
  };

  const fieldErrors = extractFieldErrors(signup.error);

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>회원가입</CardTitle>
            <CardDescription>MSA 쇼핑몰에 처음이시군요. 환영합니다.</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium">회원 유형</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 transition-colors",
                    role === r.value
                      ? "border-(--color-primary) bg-(--color-primary)/5"
                      : "border-(--color-border) hover:border-(--color-muted-foreground)",
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold">{r.label}</span>
                  <span className="mt-1 block text-xs text-(--color-muted-foreground)">
                    {r.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Input
            id="email"
            type="email"
            label="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={fieldErrors.email}
            required
          />
          <Input
            id="password"
            type="password"
            label="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            error={fieldErrors.password}
            minLength={8}
            required
          />
          <Input
            id="name"
            label="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            error={fieldErrors.name}
            required
          />
          <Input
            id="phone"
            type="tel"
            label="휴대폰 번호 (선택)"
            placeholder="010-1234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            error={fieldErrors.phone}
          />

          {signup.error && !Object.keys(fieldErrors).length && (
            <p className="text-sm text-(--color-danger)">{describeError(signup.error)}</p>
          )}

          <Button type="submit" className="w-full" disabled={signup.isPending}>
            {signup.isPending ? "가입 중..." : "회원가입"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-(--color-muted-foreground)">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-(--color-primary) hover:underline">
            로그인
          </Link>
        </p>
      </Card>
    </div>
  );
}

function extractFieldErrors(err: Error | null): Record<string, string> {
  if (!err || !(err instanceof ApiError)) return {};
  const body = err.body as { code?: string; details?: Record<string, string> } | null;
  if (body?.code === "VALIDATION_FAILED" && body.details) return body.details;
  return {};
}

function describeError(err: Error): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string } | null;
    return body?.message ?? `${err.status} ${err.statusText}`;
  }
  return err.message;
}
