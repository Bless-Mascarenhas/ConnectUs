"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/utils";

export function SoonScreen({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="max-w-md text-center"
      >
        <div className="mx-auto mb-5 h-12 w-12 rounded-2xl bg-accent-soft border border-accent/15 flex items-center justify-center">
          <Hammer className="h-5 w-5 text-accent" strokeWidth={1.75} />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
          In progress
        </p>
        <h1 className="text-display text-4xl text-ink">{title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{blurb}</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/alumni">Browse alumni →</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
