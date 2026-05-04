"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/products", label: "상품" },
  { href: "/members", label: "회원" },
  { href: "/orders", label: "주문" },
  { href: "/cart", label: "장바구니" },
  { href: "/payments", label: "결제" },
] as const;

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-(--color-primary) text-(--color-primary-foreground)"
                : "text-(--color-muted-foreground) hover:bg-(--color-muted) hover:text-(--color-foreground)",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
