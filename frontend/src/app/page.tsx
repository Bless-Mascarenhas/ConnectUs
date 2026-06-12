"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  MessageSquare,
  Calendar,
  Shield,
  Sparkles,
  CheckCircle2,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { EASE } from "@/lib/utils";

/* ─── Animation Variants ──────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay: i * 0.08 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Data ────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Users,
    title: "Alumni Directory",
    description:
      "Browse verified graduates by industry, company, and expertise. Filter, connect, and get introductions.",
    accent: "from-[#00D4AE]/20 to-[#0C6E8C]/20",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description:
      "Real-time conversations with alumni. Ask for career advice, referrals, or mentorship — one message away.",
    accent: "from-[#0C6E8C]/20 to-[#1A4C6E]/20",
  },
  {
    icon: Calendar,
    title: "Exclusive Events",
    description:
      "Join panels, workshops, and networking mixers hosted by alumni. RSVP and connect in person or virtually.",
    accent: "from-[#1A4C6E]/20 to-[#00D4AE]/20",
  },
  {
    icon: Shield,
    title: "AI-Verified Profiles",
    description:
      "Every member is verified through AI-powered document analysis. Real people, real connections, real trust.",
    accent: "from-[#00D4AE]/20 to-[#0C1B2E]/20",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Sign up & verify",
    description: "Create your account and verify your college affiliation with a quick document upload.",
  },
  {
    step: "02",
    title: "Build your profile",
    description: "Add your bio, interests, and experience. Our system matches you with relevant alumni.",
  },
  {
    step: "03",
    title: "Start connecting",
    description: "Browse alumni, send messages, join events, and grow your professional network.",
  },
];

const STATS = [
  { value: "500+", label: "Verified Alumni" },
  { value: "12", label: "Industries" },
  { value: "50+", label: "Events Hosted" },
  { value: "2min", label: "Avg. Setup Time" },
];

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 h-16">
          <Logo />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="accent" size="sm" asChild>
              <Link href="/login">
                Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-36 px-6">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00D4AE]/5 blur-[140px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0C6E8C]/8 blur-[120px]" />
          <div className="absolute top-[30%] right-[15%] w-[25%] h-[25%] rounded-full bg-[#1A4C6E]/6 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0C1B2E]/5 dark:bg-[#00D4AE]/10 border border-[#0C1B2E]/10 dark:border-[#00D4AE]/20 text-[#0C1B2E] dark:text-[#00D4AE] text-[13px] font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                The premier alumni–student network
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-[76px] font-serif tracking-[-0.03em] leading-[1.05] text-ink"
            >
              Where students{" "}
              <span className="relative inline-block">
                <span className="relative z-10">meet</span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
                  className="absolute -bottom-1 left-0 h-[4px] bg-[#00D4AE]/50 rounded-full z-0"
                />
              </span>{" "}
              <span className="italic text-ink/40">their future</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              ConnectUs bridges the gap between current students and successful alumni.
              Verified profiles, direct messaging, exclusive events — all in one beautifully
              simple platform.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button variant="accent" size="lg" className="w-full sm:w-auto text-base h-14 px-10 shadow-lg shadow-accent/20" asChild>
                <Link href="/login">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-14 px-10" asChild>
                <Link href="#features">
                  See How It Works
                </Link>
              </Button>
            </motion.div>

            {/* Trust badge */}
            <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-[#00D4AE]" />
                AI-verified profiles
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Zap className="h-4 w-4 text-[#00D4AE]" />
                2-min setup
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Globe className="h-4 w-4 text-[#00D4AE]" />
                100% free
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Banner ──────────────────────────────────────────────── */}
      <section className="border-y border-line/60 bg-surface/50">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              >
                <p className="text-3xl lg:text-4xl font-serif tracking-tight text-ink">{s.value}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-center mb-14"
          >
            <p className="text-[12px] uppercase tracking-[0.18em] font-medium text-[#00D4AE] mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-ink">
              Everything you need to{" "}
              <span className="italic text-ink/40">build your network</span>
            </h2>
            <p className="mt-4 text-[16px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
              From verified profiles to real-time messaging, ConnectUs gives you the tools to make meaningful connections.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
                className="group relative rounded-2xl bg-surface border border-line/60 p-7 hover-lift overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-[#0C1B2E] dark:bg-[#00D4AE]/10 flex items-center justify-center mb-5">
                    <f.icon className="h-5 w-5 text-[#00D4AE]" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[18px] font-medium text-ink">{f.title}</h3>
                  <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 px-6 bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-center mb-14"
          >
            <p className="text-[12px] uppercase tracking-[0.18em] font-medium text-[#00D4AE] mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-ink">
              Up and running in{" "}
              <span className="italic text-ink/40">three steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
                className="relative text-center"
              >
                {/* Connector line (desktop only) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-line to-transparent" />
                )}
                <div className="mx-auto h-20 w-20 rounded-2xl bg-[#0C1B2E] flex items-center justify-center mb-5">
                  <span className="text-2xl font-serif text-[#00D4AE] tracking-tight">{s.step}</span>
                </div>
                <h3 className="text-[17px] font-medium text-ink">{s.title}</h3>
                <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {s.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative rounded-3xl bg-[#0C1B2E] p-12 lg:p-16 overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[80%] rounded-full bg-[#00D4AE]/15 blur-[80px]" />
            <div className="absolute bottom-[-20%] left-[-5%] w-[30%] h-[60%] rounded-full bg-[#0C6E8C]/20 blur-[60px]" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-white">
                Ready to connect with your future?
              </h2>
              <p className="mt-4 text-[16px] text-white/60 max-w-lg mx-auto leading-relaxed">
                Join hundreds of students and alumni already building meaningful
                professional relationships on ConnectUs.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="h-14 px-10 text-base bg-[#00D4AE] hover:bg-[#00D4AE]/90 text-[#0C1B2E] font-medium shadow-lg shadow-[#00D4AE]/20"
                  asChild
                >
                  <Link href="/login">
                    Create Your Profile <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-line/60 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Logo />
              <p className="text-[13px] text-muted-foreground">
                Bridging the gap between students and alumni.
              </p>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-muted-foreground">
              <Link href="/login" className="hover:text-ink transition-colors">Login</Link>
              <Link href="/login" className="hover:text-ink transition-colors">Sign Up</Link>
              <a href="mailto:support@connectus.app" className="hover:text-ink transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-line/40 text-center">
            <p className="text-[12px] text-muted-foreground/60">
              © {new Date().getFullYear()} ConnectUs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
