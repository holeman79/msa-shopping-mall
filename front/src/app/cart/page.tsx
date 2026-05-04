"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { selectCartTotal, useCartStore } from "@/features/cart/store";
import { formatKRW } from "@/lib/format/currency";

export default function CartPage() {
  // Hydration guard: zustand persist hydrates from localStorage on the client only.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartTotal);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  if (!hydrated) {
    return <p className="text-sm text-(--color-muted-foreground)">불러오는 중...</p>;
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="장바구니" />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>비어있어요</CardTitle>
              <CardDescription>
                <Link href="/products" className="text-(--color-primary) hover:underline">
                  상품 목록
                </Link>
                에서 마음에 드는 상품을 담아보세요.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="장바구니"
        description={`${items.length}개 상품`}
        actions={
          <Button variant="ghost" onClick={clear}>
            전체 비우기
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.productId} className="flex items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl} alt={it.productName} className="h-20 w-20 rounded-md object-cover" />
              <div className="flex-1">
                <Link href={`/products/${it.productId}`} className="font-medium hover:text-(--color-primary)">
                  {it.productName}
                </Link>
                <p className="mt-1 text-sm text-(--color-muted-foreground)">{formatKRW(it.unitPrice)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setQuantity(it.productId, it.quantity - 1)}
                    disabled={it.quantity <= 1}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center tabular-nums">{it.quantity}</span>
                  <Button size="sm" variant="secondary" onClick={() => setQuantity(it.productId, it.quantity + 1)}>
                    +
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold tabular-nums">{formatKRW(it.unitPrice * it.quantity)}</p>
                <Button size="sm" variant="ghost" onClick={() => remove(it.productId)} className="mt-2">
                  삭제
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <div>
              <CardTitle>결제 정보</CardTitle>
            </div>
          </CardHeader>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-(--color-muted-foreground)">상품 금액</dt>
              <dd className="tabular-nums">{formatKRW(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-(--color-muted-foreground)">배송비</dt>
              <dd className="tabular-nums">무료</dd>
            </div>
            <div className="flex justify-between border-t border-(--color-border) pt-3 text-base font-bold">
              <dt>결제 예정 금액</dt>
              <dd className="tabular-nums">{formatKRW(total)}</dd>
            </div>
          </dl>
          <Button className="mt-4 w-full" size="lg">
            주문하기
          </Button>
        </Card>
      </div>
    </div>
  );
}
