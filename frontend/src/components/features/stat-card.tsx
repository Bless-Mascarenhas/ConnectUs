"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EASE, cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean };
  icon: any;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
    >
      <Card className="p-5 hover-lift group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-[15px] w-[15px]" strokeWidth={1.75} />
            <span className="text-[12px] font-medium">{label}</span>
          </div>
          {delta && (
            <span
              className={cn(
                "text-[11px] font-medium px-1.5 py-0.5 rounded-md",
                delta.positive
                  ? "text-accent bg-accent-soft"
                  : "text-muted-foreground bg-muted"
              )}
            >
              {delta.value}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-display text-[34px] text-ink">{value}</span>
        </div>
      </Card>
    </motion.div>
  );
}
