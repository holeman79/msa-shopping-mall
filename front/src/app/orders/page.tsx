"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/features/order/hooks";
import type { Order, OrderStatus } from "@/features/order/types";
import { formatKRW } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";

const STATUS: Record<OrderStatus, { label: string; tone: "default" | "success" | "warning" | "danger" | "info" }> = {
  PENDING: { label: "결제대기", tone: "warning" },
  PAID: { label: "결제완료", tone: "info" },
  SHIPPING: { label: "배송중", tone: "info" },
  DELIVERED: { label: "배송완료", tone: "success" },
  CANCELLED: { label: "취소", tone: "danger" },
};

export default function OrdersPage() {
  const { data, isLoading, error } = useOrders();

  const columns: Column<Order>[] = [
    {
      key: "id",
      header: "주문번호",
      width: "180px",
      cell: (o) => (
        <Link href={`/orders/${o.id}`} className="font-mono text-xs hover:text-(--color-primary)">
          {o.id}
        </Link>
      ),
    },
    { key: "member", header: "주문자", cell: (o) => o.memberName, width: "120px" },
    {
      key: "items",
      header: "상품",
      cell: (o) =>
        o.lines.length === 1
          ? o.lines[0]?.productName
          : `${o.lines[0]?.productName} 외 ${o.lines.length - 1}건`,
    },
    { key: "amount", header: "금액", cell: (o) => formatKRW(o.totalAmount), width: "140px", align: "right" },
    {
      key: "status",
      header: "상태",
      width: "110px",
      cell: (o) => <Badge tone={STATUS[o.status].tone}>{STATUS[o.status].label}</Badge>,
    },
    { key: "ordered", header: "주문일시", cell: (o) => formatDateTime(o.orderedAt), width: "180px" },
  ];

  return (
    <div>
      <PageHeader title="주문" description="전체 주문 내역입니다." />
      {isLoading && <p className="text-sm text-(--color-muted-foreground)">불러오는 중...</p>}
      {error && <p className="text-sm text-(--color-danger)">오류: {(error as Error).message}</p>}
      {data && <DataTable columns={columns} rows={data} rowKey={(o) => o.id} />}
    </div>
  );
}
