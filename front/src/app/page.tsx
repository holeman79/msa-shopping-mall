"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/features/product/hooks";
import { useMembers } from "@/features/member/hooks";
import { useOrders } from "@/features/order/hooks";
import { usePayments } from "@/features/payment/hooks";
import { useCartStore } from "@/features/cart/store";
import { formatKRW } from "@/lib/format/currency";

export default function HomePage() {
  const products = useProducts();
  const members = useMembers();
  const orders = useOrders();
  const payments = usePayments();
  const cartItemCount = useCartStore((s) => s.items.length);

  const totalRevenue = (payments.data ?? [])
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">관제 대시보드</h1>
        <p className="mt-2 text-sm text-(--color-muted-foreground)">
          MSA 쇼핑몰의 5개 도메인 데이터를 한눈에 확인합니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="등록 상품" value={products.data?.length} href="/products" />
        <StatCard label="활성 회원" value={members.data?.filter((m) => m.status === "ACTIVE").length} href="/members" />
        <StatCard label="총 주문" value={orders.data?.length} href="/orders" />
        <StatCard
          label="누적 매출 (승인)"
          value={payments.data ? formatKRW(totalRevenue) : undefined}
          href="/payments"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/cart">
          <Card className="transition-colors hover:border-(--color-primary)">
            <CardHeader>
              <div>
                <CardTitle>내 장바구니</CardTitle>
                <CardDescription>로컬에 저장된 항목 {cartItemCount}건</CardDescription>
              </div>
              <span className="text-3xl font-bold text-(--color-primary)">{cartItemCount}</span>
            </CardHeader>
          </Card>
        </Link>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>API 연결 모드</CardTitle>
              <CardDescription>
                현재 <code className="font-mono">NEXT_PUBLIC_USE_MOCK</code>이 켜져 있어 mock 데이터를 사용 중입니다.
                백엔드 연동 시 .env.local에서 false로 바꾸세요.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number | string | undefined; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-(--color-primary)">
        <p className="text-sm text-(--color-muted-foreground)">{label}</p>
        <p className="mt-2 text-3xl font-bold tabular-nums">{value ?? "—"}</p>
      </Card>
    </Link>
  );
}
