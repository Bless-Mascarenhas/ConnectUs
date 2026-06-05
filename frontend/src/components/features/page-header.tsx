"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between pb-8 border-b border-line/60"
    >
      <div>
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-display text-[34px] md:text-[44px] text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </motion.header>
  );
}
