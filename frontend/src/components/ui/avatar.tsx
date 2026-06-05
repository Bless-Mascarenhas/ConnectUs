"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, gradientFor, initialsOf } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  online?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = 36, online, className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      <AvatarPrimitive.Root className="relative inline-flex h-full w-full overflow-hidden rounded-full">
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={name}
            className="h-full w-full object-contain bg-surface"
          />
        )}
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-white"
          style={{ background: gradientFor(name), fontSize: Math.max(10, size * 0.34) }}
          delayMs={src ? 600 : 0}
        >
          {initialsOf(name)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-canvas",
            online ? "bg-success animate-pulse-soft" : "bg-muted-foreground/40"
          )}
          style={{ width: Math.max(8, size * 0.26), height: Math.max(8, size * 0.26) }}
        />
      )}
    </span>
  );
}
