import { cn } from "@/lib/utils";

export function Logo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative h-7 w-7 shrink-0">
        <div className="absolute inset-0 rounded-[9px] bg-ink" />
        <div className="absolute inset-[3px] rounded-[6px] bg-accent" />
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-canvas" />
      </div>
      {!collapsed && (
        <span className="font-serif text-[19px] tracking-[-0.02em] leading-none text-ink">
          ConnectUs
        </span>
      )}
    </div>
  );
}
