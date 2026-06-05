"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium select-none " +
    "transition-[transform,background,box-shadow,color] duration-150 " +
    "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-canvas hover:bg-ink/90 shadow-[0_1px_0_hsl(var(--ink))_inset,0_1px_2px_hsl(var(--ink)/0.2)]",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_1px_0_hsl(var(--accent))_inset]",
        outline:
          "bg-surface border border-line text-ink hover:bg-muted/60",
        ghost: "text-ink hover:bg-muted/60",
        subtle: "bg-muted text-ink hover:bg-muted/70",
      },
      size: {
        sm: "h-8 px-3 text-[13px] rounded-lg",
        md: "h-9 px-4 text-sm rounded-lg",
        lg: "h-11 px-5 text-[15px] rounded-xl",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";

export { buttonVariants };
