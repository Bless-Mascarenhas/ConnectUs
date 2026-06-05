"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Alumnus } from "@/types";
import { EASE } from "@/lib/utils";

export function AlumniCard({
  alumnus,
  index = 0,
  variant = "default",
}: {
  alumnus: Alumnus;
  index?: number;
  variant?: "default" | "compact";
}) {
  return (
    <motion.div
      layoutId={`alumni-card-${alumnus.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.04 }}
    >
      <Link
        href={`/alumni/${alumnus.id}`}
        className="group block rounded-2xl bg-surface border border-line/70 hover-lift overflow-hidden"
      >
        <div
          className="h-16 relative"
          style={{ background: alumnus.coverColor.startsWith("linear") ? alumnus.coverColor : `linear-gradient(135deg, ${alumnus.coverColor})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/30" />
        </div>
        <div className="px-4 pb-4 -mt-7">
          <motion.div layoutId={`alumni-avatar-${alumnus.id}`}>
            <Avatar src={alumnus.avatar} name={alumnus.name} size={48} online={alumnus.online} className="ring-4 ring-surface" />
          </motion.div>
          <div className="mt-3 min-w-0">
            <motion.h3
              layoutId={`alumni-name-${alumnus.id}`}
              className="text-[15px] font-medium text-ink truncate"
            >
              {alumnus.name}
            </motion.h3>
            <p className="text-[13px] text-muted-foreground truncate">
              {alumnus.role} · <span className="text-ink/70">{alumnus.company}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {alumnus.major} · '{String(alumnus.gradYear).slice(2)}
            </p>
          </div>
          {variant !== "compact" && (
            <div className="mt-3 flex flex-wrap gap-1">
              {alumnus.expertise.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
