"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { usePayments } from "@/features/payment/hooks";
import type { Payment, PaymentMethod, PaymentStatus } from "@/features/payment/types";
import { formatKRW } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";

const STATUS: Record<PaymentStatus, { label: string; tone: "default" | "success" | "warning" | "danger" | "info" }> = {
  READY: { label: "결제대기", tone: "warning" },
  APPROVED: { label: "승인완료", tone: "success" },
  FAILED: { label: "실패", tone: "danger" },
  CANCELLED: { label: "취소", tone: "default" },
  REFUNDED: { label: "환불", tone: "info" },
};

const METHOD: Record<PaymentMethod, string> = {
  CARD: "신용카드",
  TRANSFER: "계좌이체",
  VIRTUAL_ACCOUNT: "가상계좌",
  POINT: "포인트",
};

export default function PaymentsPage() {
  const { data, isLoading, error } = usePayments();

  const columns: Column<Payment>[] = [
    { key: "id", header: "결제번호", cell: (p) => <span className="font-mono text-xs">{p.id}</span>, width: "180px" },
    {
      key: "order",
      header: "주문번호",
      width: "180px",
      cell: (p) => (
        <Link href={`/orders/${p.orderId}`} className="font-mono text-xs hover:text-(--color-primary)">
          {p.orderId}
        </Link>
      ),
    },
    { key: "method", header: "결제수단", cell: (p) => METHOD[p.method], width: "110px" },
    { key: "amount", header: "금액", cell: (p) => formatKRW(p.amount), width: "140px", align: "right" },
    {
      key: "status",
      header: "상태",
      width: "110px",
      cell: (p) => <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>,
    },
    { key: "pg", header: "PG사", cell: (p) => p.pgProvider, width: "140px" },
    {
      key: "approved",
      header: "승인일시",
      width: "180px",
      cell: (p) =>
        p.approvedAt ? formatDateTime(p.approvedAt) : <span className="text-(--color-muted-foreground)">-</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="결제" description="결제 내역과 PG사 승인 상태입니다." />
      {isLoading && <p className="text-sm text-(--color-muted-foreground)">불러오는 중...</p>}
      {error && <p className="text-sm text-(--color-danger)">오류: {(error as Error).message}</p>}
      {data && <DataTable columns={columns} rows={data} rowKey={(p) => p.id} />}
    </div>
  );
}
