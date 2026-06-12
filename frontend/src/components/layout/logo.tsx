import { cn } from "@/lib/utils";

export function Logo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg className="h-7 w-7 shrink-0" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
        <rect width="72" height="72" rx="20" fill="#0C1B2E"></rect>
        <g fill="none" stroke="#1A4C6E" strokeWidth="1.5" strokeLinecap="round">
          <line className="cl l0" x1="10" y1="36" x2="62" y2="36"></line>
          <line className="cl l1" x1="10" y1="36" x2="23" y2="14"></line>
          <line className="cl l2" x1="10" y1="36" x2="23" y2="58"></line>
          <line className="cl l3" x1="62" y1="36" x2="49" y2="14"></line>
          <line className="cl l4" x1="62" y1="36" x2="49" y2="58"></line>
          <line className="cl l5" x1="23" y1="14" x2="49" y2="14"></line>
          <line className="cl l6" x1="23" y1="58" x2="49" y2="58"></line>
        </g>
        <circle className="cn n0" cx="23" cy="14" r="3.5" fill="#0C6E8C"></circle>
        <circle className="cn n1" cx="49" cy="14" r="3.5" fill="#0C6E8C"></circle>
        <circle className="cn n2" cx="23" cy="58" r="3.5" fill="#0C6E8C"></circle>
        <circle className="cn n3" cx="49" cy="58" r="3.5" fill="#0C6E8C"></circle>
        <circle className="ch h0" cx="10" cy="36" r="7" fill="#00D4AE"></circle>
        <circle className="ch h1" cx="62" cy="36" r="7" fill="#00D4AE"></circle>
      </svg>
      {!collapsed && (
        <span className="font-serif text-[19px] tracking-[-0.02em] leading-none text-ink">
          ConnectUs
        </span>
      )}
    </div>
  );
}
