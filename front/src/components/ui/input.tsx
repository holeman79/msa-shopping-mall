import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, ...rest },
  ref,
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "h-10 w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 text-sm",
          "focus:border-(--color-primary) focus:outline-none",
          error && "border-(--color-danger)",
          className,
        )}
        {...rest}
      />
      {error && <p className="text-xs text-(--color-danger)">{error}</p>}
    </div>
  );
});
