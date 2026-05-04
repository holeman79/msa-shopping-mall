"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useProduct } from "@/features/product/hooks";
import { useCartStore } from "@/features/cart/store";
import { formatKRW } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = Number(id);
  const { data, isLoading, error } = useProduct(productId);
  const addToCart = useCartStore((s) => s.add);

  if (isLoading) return <p className="text-sm text-(--color-muted-foreground)">불러오는 중...</p>;
  if (error) return <p className="text-sm text-(--color-danger)">오류: {(error as Error).message}</p>;
  if (!data) return null;

  const handleAddToCart = () => {
    addToCart({
      productId: data.id,
      productName: data.name,
      unitPrice: data.price,
      quantity: 1,
      imageUrl: data.imageUrl,
    });
  };

  return (
    <div>
      <PageHeader title={data.name} description={`${data.category} · ID ${data.id}`} />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-(--color-border)">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.imageUrl} alt={data.name} className="aspect-square w-full object-cover" />
        </div>
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-(--color-muted-foreground)">판매가</p>
            <p className="mt-1 text-3xl font-bold">{formatKRW(data.price)}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Badge tone={data.status === "ON_SALE" ? "success" : data.status === "SOLD_OUT" ? "danger" : "default"}>
                {data.status}
              </Badge>
              <span className="text-(--color-muted-foreground)">재고 {data.stock.toLocaleString()}개</span>
            </div>
            <p className="mt-4 text-sm text-(--color-muted-foreground)">{data.description}</p>
            <p className="mt-2 text-xs text-(--color-muted-foreground)">등록: {formatDateTime(data.createdAt)}</p>
            <div className="mt-6 flex gap-2">
              <Button onClick={handleAddToCart} disabled={data.status !== "ON_SALE"}>
                장바구니 담기
              </Button>
              <Button variant="secondary" disabled={data.status !== "ON_SALE"}>
                바로 주문
              </Button>
            </div>
          </Card>
          <Card>
            <p className="mb-2 text-sm font-medium">Raw payload</p>
            <pre className="overflow-x-auto rounded-md bg-(--color-muted) p-3 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
