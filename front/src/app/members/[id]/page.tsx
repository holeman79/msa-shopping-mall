"use client";

import { use } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useMember } from "@/features/member/hooks";
import { formatKRW } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useMember(Number(id));

  if (isLoading) return <p className="text-sm text-(--color-muted-foreground)">불러오는 중...</p>;
  if (error) return <p className="text-sm text-(--color-danger)">오류: {(error as Error).message}</p>;
  if (!data) return null;

  return (
    <div>
      <PageHeader title={data.name} description={data.email} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>회원 정보</CardTitle>
              <CardDescription>ID {data.id}</CardDescription>
            </div>
            <Badge tone={data.status === "ACTIVE" ? "success" : "default"}>{data.status}</Badge>
          </CardHeader>
          <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            <dt className="text-(--color-muted-foreground)">등급</dt>
            <dd>
              <Badge>{data.grade}</Badge>
            </dd>
            <dt className="text-(--color-muted-foreground)">연락처</dt>
            <dd>{data.phone}</dd>
            <dt className="text-(--color-muted-foreground)">누적 구매</dt>
            <dd className="font-semibold">{formatKRW(data.totalOrderAmount)}</dd>
            <dt className="text-(--color-muted-foreground)">가입일</dt>
            <dd>{formatDateTime(data.joinedAt)}</dd>
          </dl>
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
