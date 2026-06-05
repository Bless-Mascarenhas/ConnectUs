"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Bell, Calendar, MessageSquare, ArrowRight, Sparkles, GraduationCap,
  TrendingUp, Plus, Search,
} from "lucide-react";
import { PageHeader } from "@/components/features/page-header";
import { StatCard } from "@/components/features/stat-card";
import { AlumniCard } from "@/components/features/alumni-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { EASE, greeting, relativeTime } from "@/lib/utils";
import type { Alumnus, EventItem, Me, PostFull } from "@/types";

export default function DashboardPage() {
  const [me, setMe] = React.useState<Me | null>(null);
  const [alumni, setAlumni] = React.useState<Alumnus[]>([]);
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [feed, setFeed] = React.useState<PostFull[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      api<Me>("/api/users/me"),
      api<Alumnus[]>("/api/alumni"),
      api<EventItem[]>("/api/events"),
      api<PostFull[]>("/api/feed"),
    ])
      .then(([m, a, e, f]) => {
        setMe(m); setAlumni(a); setEvents(e); setFeed(f);
      })
      .finally(() => setLoading(false));
  }, []);

  const recommended = React.useMemo(
    () => alumni.filter((a) => a.available).slice(0, 8),
    [alumni]
  );
  const upcoming = React.useMemo(
    () => events.filter((e) => new Date(e.date).getTime() > Date.now()).slice(0, 3),
    [events]
  );
  const activity = feed.slice(0, 5);

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-14 max-w-[1280px] mx-auto">
      <PageHeader
        eyebrow={greeting()}
        title={
          loading ? (
            <Skeleton className="h-10 w-[280px]" />
          ) : (
            <>
              <span className="text-ink/40">Hey,</span>{" "}
              <span className="italic">{me?.name.split(" ")[0]}</span>
            </>
          )
        }
        description="Here's what's happening in your network today."
        right={
          <>
            <Button variant="outline" size="md" asChild>
              <Link href="/alumni"><Search className="h-4 w-4" />Browse alumni</Link>
            </Button>
            <Button variant="accent" size="md" asChild>
              <Link href="/feed"><Plus className="h-4 w-4" />New post</Link>
            </Button>
          </>
        }
      />

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {loading || !me ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[112px]" />)
        ) : (
          <>
            <StatCard label="Connections" value={me.stats.connections} icon={Users} delta={{ value: "+4 this week", positive: true }} delay={0.0} />
            <StatCard label="Pending requests" value={me.stats.pending} icon={Bell} delay={0.04} />
            <StatCard label="Upcoming events" value={me.stats.events} icon={Calendar} delay={0.08} />
            <StatCard label="Unread messages" value={me.stats.unread} icon={MessageSquare} delay={0.12} />
          </>
        )}
      </section>

      {/* Recommended alumni */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-display text-2xl text-ink">Recommended for you</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Alumni who studied {me?.major ?? "your major"} and are available to chat.
            </p>
          </div>
          <Link href="/alumni" className="text-sm text-muted-foreground hover:text-ink inline-flex items-center gap-1 group">
            View all <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[210px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recommended.slice(0, 4).map((a, i) => (
              <AlumniCard key={a.id} alumnus={a} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between flex-row">
            <CardTitle><Sparkles className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />Recent activity</CardTitle>
            <Link href="/feed" className="text-[12px] text-muted-foreground hover:text-ink">See feed →</Link>
          </CardHeader>
          <CardContent className="divide-y divide-line/60 pt-0">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 py-3"><Skeleton className="h-9 w-9 rounded-full" /><div className="flex-1"><Skeleton className="h-3 w-1/3 mb-2" /><Skeleton className="h-3 w-3/4" /></div></div>
              ))
            ) : (
              activity.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: EASE, delay: i * 0.04 }}
                  className="flex gap-3 py-3.5"
                >
                  <Avatar src={p.author?.avatar} name={p.author?.name || "Unknown"} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-medium text-ink">{p.author?.name || "Unknown"}</span>
                      <span className="text-[11px] text-muted-foreground">{relativeTime(p.createdAt)}</span>
                    </div>
                    <p className="text-[13px] text-ink/80 leading-relaxed line-clamp-2">{p.content}</p>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming events */}
        <Card>
          <CardHeader className="flex items-center justify-between flex-row">
            <CardTitle><Calendar className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />Upcoming events</CardTitle>
            <Link href="/events" className="text-[12px] text-muted-foreground hover:text-ink">All →</Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)
            ) : upcoming.length === 0 ? (
              <EmptyState />
            ) : (
              upcoming.map((e, i) => {
                const d = new Date(e.date);
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE, delay: i * 0.05 }}
                    className="flex gap-3 rounded-xl p-3 -mx-1 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <div
                      className="flex flex-col items-center justify-center h-12 w-12 rounded-lg shrink-0 text-canvas"
                      style={{ background: `linear-gradient(135deg, ${e.cover})` }}
                    >
                      <span className="text-[10px] uppercase tracking-wider opacity-80">
                        {d.toLocaleString("en", { month: "short" })}
                      </span>
                      <span className="text-[17px] font-semibold leading-none">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-ink truncate">{e.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {d.toLocaleString("en", { weekday: "short", hour: "numeric", minute: "2-digit" })} · {e.virtual ? "Virtual" : e.location}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick actions */}
      <section className="mt-12 mb-8">
        <h2 className="text-display text-xl text-ink mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/mentorship", icon: GraduationCap, label: "Book a mentor", desc: "Reserve a 1:1 session" },
            { href: "/alumni", icon: Search, label: "Find alumni", desc: "Filter by year, role, expertise" },
            { href: "/events", icon: Calendar, label: "Browse events", desc: "Mixers, panels, workshops" },
            { href: "/profile", icon: TrendingUp, label: "Update profile", desc: "Make recommendations sharper" },
          ].map((q, i) => (
            <motion.div
              key={q.href}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.05 + i * 0.04 }}
            >
              <Link
                href={q.href}
                className="group block rounded-2xl bg-surface border border-line/70 p-4 hover-lift"
              >
                <div className="flex items-center justify-between">
                  <q.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>
                <p className="mt-3 text-[14px] font-medium text-ink">{q.label}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{q.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-6 px-3">
      <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center mb-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-[13px] font-medium text-ink">Nothing on the calendar</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">Events you RSVP to appear here.</p>
    </div>
  );
}
