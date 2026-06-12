"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, Users, MessageSquare, Calendar, Sparkles,
  User, Settings, Search, CornerDownLeft, ArrowUp, ArrowDown,
} from "lucide-react";
import { cn, EASE } from "@/lib/utils";

interface Cmd {
  id: string;
  label: string;
  group: string;
  icon: any;
  action: () => void;
  shortcut?: string;
}

const CommandPaletteContext = React.createContext<{ open: () => void } | null>(null);

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext);
  return { open: ctx?.open ?? (() => {}) };
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = React.useState(false);
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(0);

  const commands: Cmd[] = React.useMemo(() => {
    const go = (href: string) => () => { router.push(href); setOpen(false); };
    return [
      { id: "go-dashboard", label: "Go to Dashboard", group: "Navigate", icon: LayoutGrid, action: go("/"), shortcut: "G D" },
      { id: "go-alumni", label: "Go to Alumni Directory", group: "Navigate", icon: Users, action: go("/alumni"), shortcut: "G A" },
      { id: "go-messages", label: "Go to Messages", group: "Navigate", icon: MessageSquare, action: go("/messages"), shortcut: "G M" },

      { id: "go-events", label: "Go to Events", group: "Navigate", icon: Calendar, action: go("/events") },
      { id: "go-feed", label: "Go to Community Feed", group: "Navigate", icon: Sparkles, action: go("/feed") },
      { id: "go-profile", label: "Open your profile", group: "Account", icon: User, action: go("/profile") },
      { id: "go-settings", label: "Open settings", group: "Account", icon: Settings, action: go("/settings") },
    ];
  }, [router]);

  const filtered = React.useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => setSelected(0), [query, isOpen]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[selected]?.action();
    }
  };

  const grouped = React.useMemo(() => {
    const out = new Map<string, Cmd[]>();
    filtered.forEach((c) => {
      if (!out.has(c.group)) out.set(c.group, []);
      out.get(c.group)!.push(c);
    });
    return Array.from(out.entries());
  }, [filtered]);

  let runningIdx = 0;

  return (
    <CommandPaletteContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="fixed left-1/2 top-[18%] z-50 w-[92vw] max-w-xl -translate-x-1/2"
              onKeyDown={onListKey}
            >
              <div className="overflow-hidden rounded-2xl bg-surface border border-line/80 shadow-[0_24px_60px_-20px_hsl(var(--ink)/0.35)]">
                <div className="flex items-center gap-2.5 border-b border-line/70 px-4 h-12">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    autoFocus
                    placeholder="Search or jump to…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
                  />
                  <span className="kbd">esc</span>
                </div>
                <div className="max-h-[420px] overflow-y-auto p-1.5">
                  {grouped.length === 0 && (
                    <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                      No results for &quot;<span className="text-ink">{query}</span>&quot;
                    </div>
                  )}
                  {grouped.map(([group, items]) => (
                    <div key={group} className="mb-1">
                      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
                        {group}
                      </div>
                      {items.map((c) => {
                        const idx = runningIdx++;
                        const active = idx === selected;
                        return (
                          <button
                            key={c.id}
                            onMouseEnter={() => setSelected(idx)}
                            onClick={c.action}
                            className={cn(
                              "group flex w-full items-center gap-2.5 rounded-lg px-3 h-9 text-sm transition-colors",
                              active ? "bg-muted text-ink" : "text-ink/80 hover:bg-muted/60"
                            )}
                          >
                            <c.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                            <span className="flex-1 text-left">{c.label}</span>
                            {c.shortcut && (
                              <span className="kbd opacity-0 group-hover:opacity-100 transition-opacity">
                                {c.shortcut}
                              </span>
                            )}
                            {active && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line/70 px-4 h-10 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> navigate</span>
                    <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> select</span>
                  </div>
                  <span>ConnectUs</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </CommandPaletteContext.Provider>
  );
}
