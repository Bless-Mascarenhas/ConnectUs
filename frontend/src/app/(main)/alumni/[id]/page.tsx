"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap, MessageSquare, UserPlus,
  Sparkles, Building2, CheckCircle2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { EASE } from "@/lib/utils";
import type { Alumnus } from "@/types";

export default function AlumnusProfile() {
  const { id } = useParams<{ id: string }>();
  const [alumnus, setAlumnus] = React.useState<Alumnus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [connected, setConnected] = React.useState(false);
  const [connecting, setConnecting] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      api<Alumnus>(`/api/alumni/${id}`),
      api<{ alumniId: string }[]>("/api/connections").catch(() => []),
    ]).then(([a, conns]) => {
      setAlumnus(a);
      setConnected(conns.some(c => c.alumniId === id));
    }).finally(() => setLoading(false));
  }, [id]);

  const toggleConnect = async () => {
    if (!id) return;
    setConnecting(true);
    try {
      if (connected) {
        await api(`/api/connections/${id}`, { method: "DELETE" });
        setConnected(false);
      } else {
        await api(`/api/connections/${id}`, { method: "POST" });
        setConnected(true);
      }
    } finally {
      setConnecting(false);
    }
  };

  if (loading || !alumnus) {
    return (
      <div className="px-6 lg:px-12 py-10 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-72 mb-3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  const cover = alumnus.coverColor.startsWith("linear")
    ? alumnus.coverColor
    : `linear-gradient(135deg, ${alumnus.coverColor})`;

  return (
    <div className="px-6 lg:px-12 py-8 lg:py-10 max-w-5xl mx-auto">
      <Link
        href="/alumni"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-ink transition-colors mb-6 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to directory
      </Link>

      {/* Hero */}
      <motion.div
        layoutId={`alumni-card-${alumnus.id}`}
        className="rounded-3xl overflow-hidden bg-surface border border-line/70"
      >
        <div className="h-44 lg:h-56 relative" style={{ background: cover }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/20" />
        </div>
        <div className="px-6 lg:px-8 pb-6 lg:pb-8 -mt-14 relative z-10">
          <div className="flex flex-col gap-4">
            <motion.div layoutId={`alumni-avatar-${alumnus.id}`} className="self-start">
              <Avatar src={alumnus.avatar} name={alumnus.name} size={104} online={alumnus.online} className="ring-4 ring-surface bg-surface" />
            </motion.div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="min-w-0">
                <motion.h1
                  layoutId={`alumni-name-${alumnus.id}`}
                  className="text-display text-3xl lg:text-4xl text-ink"
                >
                  {alumnus.name}
                </motion.h1>
                <p className="mt-1 text-[15px] text-ink/80">
                  {alumnus.role} <span className="text-muted-foreground">at</span>{" "}
                  <span className="font-medium text-ink">{alumnus.company}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {alumnus.location}</span>
                  <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {alumnus.university}, '{String(alumnus.gradYear).slice(2)}</span>
                  {alumnus.available && (
                    <Badge variant="accent" className="gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" /> Open to mentorship
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant={connected ? "subtle" : "primary"} onClick={toggleConnect} disabled={connecting}>
                  {connected ? <><CheckCircle2 className="h-4 w-4" />Connected</> : <><UserPlus className="h-4 w-4" />Connect</>}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/messages"><MessageSquare className="h-4 w-4" />Message</Link>
                </Button>
                <Button variant="accent" asChild>
                  <Link href="/mentorship"><Sparkles className="h-4 w-4" />Book mentorship</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Body grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="About" icon={null} delay={0.05}>
            <p className="text-[15px] leading-relaxed text-ink/85 font-serif">
              {alumnus.bio}
            </p>
          </Section>

          <Section title="Experience" icon={Briefcase} delay={0.1}>
            <ol className="relative space-y-5 pl-5 before:content-[''] before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-px before:bg-line">
              {alumnus.workHistory.map((w, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: EASE, delay: 0.12 + i * 0.05 }}
                  className="relative"
                >
                  <span className="absolute -left-[14px] top-1.5 h-2.5 w-2.5 rounded-full bg-surface border-2 border-accent" />
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[14px] font-medium text-ink">{w.role}</p>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{w.from} — {w.to}</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground inline-flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" />{w.company}
                  </p>
                </motion.li>
              ))}
            </ol>
          </Section>

          <Section title="Education" icon={GraduationCap} delay={0.15}>
            {alumnus.education.map((e, i) => (
              <div key={i} className="flex items-baseline justify-between">
                <div>
                  <p className="text-[14px] font-medium text-ink">{e.school}</p>
                  <p className="text-[13px] text-muted-foreground">{e.degree}</p>
                </div>
                <span className="text-[12px] text-muted-foreground">Class of {e.year}</span>
              </div>
            ))}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Areas of expertise" icon={Sparkles} delay={0.08}>
            <div className="flex flex-wrap gap-1.5">
              {alumnus.expertise.map((e, i) => (
                <motion.div
                  key={e}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: EASE, delay: 0.1 + i * 0.04 }}
                >
                  <Badge variant="accent">{e}</Badge>
                </motion.div>
              ))}
            </div>
          </Section>

          <Section title="Quick facts" icon={null} delay={0.12}>
            <dl className="text-[13px] divide-y divide-line/60">
              <Fact k="Industry" v={alumnus.industry} />
              <Fact k="Major" v={alumnus.major} />
              <Fact k="Class" v={String(alumnus.gradYear)} />
              <Fact k="Status" v={alumnus.online ? "Online now" : "Offline"} />
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title, icon: Icon, children, delay = 0,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {Icon && <Icon className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-ink font-medium">{v}</dd>
    </div>
  );
}
