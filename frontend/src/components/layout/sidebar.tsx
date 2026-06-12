"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, Users, MessageSquare, Calendar, Sparkles,
  User, Settings, ChevronLeft, Search, PanelLeftClose, Menu, X,
} from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn, EASE } from "@/lib/utils";
import { useCommandPalette } from "@/components/features/command-palette";

const PRIMARY = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/alumni", icon: Users, label: "Alumni" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/feed", icon: Sparkles, label: "Feed" },
];

const SECONDARY = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { open: openPalette } = useCommandPalette();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href);
    const content = (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-2.5 h-9 text-sm",
          "transition-colors duration-150",
          active
            ? "text-ink bg-muted/70"
            : "text-muted-foreground hover:text-ink hover:bg-muted/40"
        )}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-accent"
            transition={{ duration: 0.25, ease: EASE }}
          />
        )}
        <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-ink")} strokeWidth={1.75} />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
    return collapsed ? <Tooltip content={label}>{content}</Tooltip> : content;
  };

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center justify-between px-4 h-16", collapsed && "justify-center px-2")}>
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-ink transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-muted-foreground"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={openPalette}
          className={cn(
            "group flex w-full items-center gap-2 rounded-lg border border-line/70 bg-canvas/50",
            "px-2.5 h-9 text-sm text-muted-foreground hover:bg-muted/40 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search…</span>
              <span className="kbd">⌘K</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        {!collapsed && (
          <div className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
            Workspace
          </div>
        )}
        <nav className="flex flex-col gap-0.5">
          {PRIMARY.map((item) => <NavItem key={item.href} {...item} />)}
        </nav>

        <div className="my-4 h-px bg-line/70" />

        {!collapsed && (
          <div className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
            Account
          </div>
        )}
        <nav className="flex flex-col gap-0.5">
          {SECONDARY.map((item) => <NavItem key={item.href} {...item} />)}
        </nav>
      </div>

      <div className={cn("border-t border-line/70 p-3 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        <ThemeToggle compact={collapsed} />
        {!collapsed && (
          <span className="text-[11px] text-muted-foreground">v1.0</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 h-9 w-9 inline-flex items-center justify-center rounded-lg bg-surface border border-line/70 shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 248 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col bg-canvas border-r border-line/70"
      >
        {SidebarBody}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[264px] bg-canvas border-r border-line/70"
            >
              {SidebarBody}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Layout spacer */}
      <motion.div
        animate={{ width: collapsed ? 72 : 248 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="hidden lg:block shrink-0"
        aria-hidden
      />
    </>
  );
}
