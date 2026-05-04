"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useMembers } from "@/features/member/hooks";
import type { Member, MemberGrade, MemberStatus } from "@/features/member/types";
import { formatKRW } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";

const GRADE_TONE: Record<MemberGrade, "default" | "info" | "warning" | "danger"> = {
  BASIC: "default",
  SILVER: "info",
  GOLD: "warning",
  VIP: "danger",
};

const STATUS_TONE: Record<MemberStatus, "success" | "warning" | "default"> = {
  ACTIVE: "success",
  DORMANT: "warning",
  WITHDRAWN: "default",
};

export default function MembersPage() {
  const { data, isLoading, error } = useMembers();

  const columns: Column<Member>[] = [
    { key: "id", header: "ID", cell: (m) => <span className="font-mono text-xs">{m.id}</span>, width: "60px" },
    {
      key: "name",
      header: "이름",
      cell: (m) => (
        <Link href={`/members/${m.id}`} className="font-medium hover:text-(--color-primary)">
          {m.name}
        </Link>
      ),
    },
    { key: "email", header: "이메일", cell: (m) => <span className="text-(--color-muted-foreground)">{m.email}</span> },
    { key: "phone", header: "연락처", cell: (m) => m.phone, width: "150px" },
    {
      key: "grade",
      header: "등급",
      cell: (m) => <Badge tone={GRADE_TONE[m.grade]}>{m.grade}</Badge>,
      width: "100px",
    },
    {
      key: "status",
      header: "상태",
      cell: (m) => <Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge>,
      width: "100px",
    },
    { key: "total", header: "누적 구매", cell: (m) => formatKRW(m.totalOrderAmount), width: "140px", align: "right" },
    { key: "joined", header: "가입일", cell: (m) => formatDateTime(m.joinedAt), width: "180px" },
  ];

  return (
    <div>
      <PageHeader title="회원" description="가입 회원 목록입니다." />
      {isLoading && <p className="text-sm text-(--color-muted-foreground)">불러오는 중...</p>}
      {error && <p className="text-sm text-(--color-danger)">오류: {(error as Error).message}</p>}
      {data && <DataTable columns={columns} rows={data} rowKey={(m) => m.id} />}
    </div>
  );
}
