"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useOrder } from "@/features/order/hooks";
import { formatKRW } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useOrder(id);

  if (isLoading) return <p className="text-sm text-(--color-muted-foreground)">불러오는 중...</p>;
  if (error) return <p className="text-sm text-(--color-danger)">오류: {(error as Error).message}</p>;
  if (!data) return null;

  return (
    <div>
      <PageHeader title={data.id} description={`주문일시: ${formatDateTime(data.orderedAt)}`} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>주문 항목 ({data.lines.length})</CardTitle>
              <CardDescription>
                <Link href={`/members/${data.memberId}`} className="hover:text-(--color-primary)">
                  {data.memberName}
                </Link>{" "}
                · {data.shippingAddress}
              </CardDescription>
            </div>
            <Badge tone={data.status === "DELIVERED" ? "success" : data.status === "CANCELLED" ? "danger" : "info"}>
              {data.status}
            </Badge>
          </CardHeader>
          <ul className="divide-y divide-(--color-border)">
            {data.lines.map((l) => (
              <li key={l.productId} className="flex items-center justify-between py-3 text-sm">
                <Link href={`/products/${l.productId}`} className="hover:text-(--color-primary)">
                  {l.productName}
                </Link>
                <span className="text-(--color-muted-foreground)">
                  {formatKRW(l.unitPrice)} × {l.quantity}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-(--color-border) pt-4">
            <span className="text-sm text-(--color-muted-foreground)">합계</span>
            <span className="text-xl font-bold">{formatKRW(data.totalAmount)}</span>
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
  );
}
