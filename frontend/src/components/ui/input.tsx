import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-lg bg-surface border border-line/80 px-3 text-sm text-ink",
        "placeholder:text-muted-foreground/70 outline-none",
        "focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
