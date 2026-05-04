import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "default" | "success" | "warning" | "danger" | "info";

const TONE: Record<Tone, string> = {
  default: "bg-(--color-muted) text-(--color-foreground)",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "default", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE[tone],
        className,
      )}
      {...rest}
    />
  );
}
