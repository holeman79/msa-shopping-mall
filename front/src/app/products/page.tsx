"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/features/product/hooks";
import type { Product, ProductStatus } from "@/features/product/types";
import { formatKRW } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";

const STATUS: Record<ProductStatus, { label: string; tone: "success" | "danger" | "default" }> = {
  ON_SALE: { label: "판매중", tone: "success" },
  SOLD_OUT: { label: "품절", tone: "danger" },
  HIDDEN: { label: "비공개", tone: "default" },
};

export default function ProductsPage() {
  const { data, isLoading, error } = useProducts();

  const columns: Column<Product>[] = [
    { key: "id", header: "ID", cell: (p) => <span className="font-mono text-xs">{p.id}</span>, width: "60px" },
    {
      key: "name",
      header: "상품명",
      cell: (p) => (
        <Link href={`/products/${p.id}`} className="font-medium hover:text-(--color-primary)">
          {p.name}
        </Link>
      ),
    },
    { key: "category", header: "카테고리", cell: (p) => p.category, width: "120px" },
    { key: "price", header: "가격", cell: (p) => formatKRW(p.price), width: "140px", align: "right" },
    { key: "stock", header: "재고", cell: (p) => p.stock.toLocaleString(), width: "80px", align: "right" },
    {
      key: "status",
      header: "상태",
      width: "100px",
      cell: (p) => <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>,
    },
    { key: "createdAt", header: "등록일", cell: (p) => formatDateTime(p.createdAt), width: "180px" },
  ];

  return (
    <div>
      <PageHeader title="상품" description="등록된 상품 목록입니다." />
      {isLoading && <p className="text-sm text-(--color-muted-foreground)">불러오는 중...</p>}
      {error && <p className="text-sm text-(--color-danger)">오류: {(error as Error).message}</p>}
      {data && <DataTable columns={columns} rows={data} rowKey={(p) => p.id} />}
    </div>
  );
}
