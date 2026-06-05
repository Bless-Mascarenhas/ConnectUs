"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/utils";

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = mounted ? resolvedTheme ?? theme : "light";
  const isDark = current === "dark";

  return (
    <Button
      variant="ghost"
      size={compact ? "icon" : "sm"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: 8, opacity: 0, rotate: -20 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -8, opacity: 0, rotate: 20 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="inline-flex items-center gap-2"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {!compact && <span>{isDark ? "Dark" : "Light"}</span>}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
