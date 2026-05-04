import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty = "데이터가 없습니다.",
  onRowClick,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-(--color-border) p-10 text-center text-sm text-(--color-muted-foreground)">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-(--color-border)">
      <table className="w-full text-sm">
        <thead className="bg-(--color-muted) text-(--color-muted-foreground)">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  "px-4 py-3 text-left font-medium",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-t border-(--color-border)",
                onRowClick && "cursor-pointer hover:bg-(--color-muted)",
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
