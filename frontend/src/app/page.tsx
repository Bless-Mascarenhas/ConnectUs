"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Play,
  Star,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { EASE } from "@/lib/utils";

/* ─── Animation helpers ───────────────────────────────────────────────── */

const fade = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.1 },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

/* ─── Data ────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Users,
    title: "Alumni Directory",
    desc: "Browse verified graduates by industry, company, and expertise.",
    color: "#00D4AE",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    desc: "Real-time conversations — career advice is one message away.",
    color: "#0C6E8C",
  },
  {
    icon: Calendar,
    title: "Exclusive Events",
    desc: "Panels, workshops, and networking mixers. RSVP instantly.",
    color: "#1A4C6E",
  },
  {
    icon: Shield,
    title: "AI-Verified Profiles",
    desc: "Every member verified through AI document analysis. Real trust.",
    color: "#00D4AE",
  },
];

const STEPS = [
  { n: "01", title: "Sign up & verify", desc: "Create your account and verify your college affiliation." },
  { n: "02", title: "Build your profile", desc: "Add your bio, interests, and career experience." },
  { n: "03", title: "Start connecting", desc: "Browse alumni, send messages, and join events." },
];

const TESTIMONIALS = [
  {
    quote: "ConnectUs helped me land my dream internship through an alumni referral I never would have found otherwise.",
    name: "Priya Sharma",
    role: "CS Student, Batch '26",
    initials: "PS",
  },
  {
    quote: "As an alumnus, giving back to my college community has never been this seamless and rewarding.",
    name: "Rahul Mehta",
    role: "Software Engineer at Google",
    initials: "RM",
  },
  {
    quote: "The events feature alone made it worth it — I've attended 5 alumni panels this semester.",
    name: "Ananya Desai",
    role: "MBA Student, Batch '25",
    initials: "AD",
  },
];

const STATS = [
  { value: "500+", label: "Verified Alumni" },
  { value: "12", label: "Industries" },
  { value: "50+", label: "Events Hosted" },
  { value: "2 min", label: "Avg. Setup" },
];

/* ─── Floating Navbar ─────────────────────────────────────────────────── */

function FloatingNav() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
      className={`nav-float transition-all duration-300 ${
        scrolled ? "shadow-[0_4px_32px_-8px_hsl(var(--ink)/0.12)]" : ""
      }`}
    >
      <div className="flex items-center gap-1">
        <div className="pl-3 pr-4">
          <Logo />
        </div>
        <div className="hidden sm:flex items-center gap-0.5">
          {["Features", "How it Works", "Testimonials"].map((t) => (
            <a
              key={t}
              href={`#${t.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-3.5 py-2 text-[13px] font-medium text-muted-foreground hover:text-ink rounded-full hover:bg-muted/60 transition-colors"
            >
              {t}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <Button variant="ghost" size="sm" asChild className="rounded-full hidden sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="rounded-full bg-[#0C1B2E] hover:bg-[#0C1B2E]/90 text-white dark:bg-[#00D4AE] dark:text-[#0C1B2E] dark:hover:bg-[#00D4AE]/90 px-5"
          >
            <Link href="/login">
              Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas overflow-x-hidden">
      <FloatingNav />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6">
        {/* Grid bg */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[10%] w-[50%] h-[50%] rounded-full bg-[#00D4AE]/6 blur-[160px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[45%] h-[45%] rounded-full bg-[#0C6E8C]/8 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
            {/* Pill badge */}
            <motion.div variants={fade} custom={0} className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D4AE]/8 border border-[#00D4AE]/15 text-[13px] font-medium text-[#0C1B2E] dark:text-[#00D4AE]">
                <Sparkles className="h-3.5 w-3.5" />
                The premier alumni–student network
                <ChevronRight className="h-3 w-3 opacity-50" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fade}
              custom={1}
              className="text-[clamp(2.5rem,6vw,5rem)] font-serif tracking-[-0.03em] leading-[1.05]"
            >
              Your alumni network,
              <br />
              <span className="gradient-text">finally connected</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fade}
              custom={2}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              ConnectUs bridges the gap between students and alumni with verified
              profiles, instant messaging, and exclusive events — all in one
              beautifully simple platform.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fade} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto text-base h-14 px-10 rounded-full bg-[#0C1B2E] hover:bg-[#0C1B2E]/90 text-white dark:bg-[#00D4AE] dark:text-[#0C1B2E] dark:hover:bg-[#00D4AE]/90 shadow-xl shadow-[#0C1B2E]/15 dark:shadow-[#00D4AE]/15"
              >
                <Link href="/login">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto text-base h-14 px-10 rounded-full">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </motion.div>

            {/* Trust pills */}
            <motion.div variants={fade} custom={4} className="flex flex-wrap items-center justify-center gap-5 pt-2">
              {[
                { icon: CheckCircle2, text: "AI-verified profiles" },
                { icon: Zap, text: "2-min setup" },
                { icon: Globe, text: "100% free" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Icon className="h-4 w-4 text-[#00D4AE]" />
                  {text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero visual — App preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
            className="mt-16 lg:mt-24 relative mx-auto max-w-4xl"
          >
            <div className="relative rounded-2xl lg:rounded-3xl border border-line/60 bg-surface shadow-[0_32px_80px_-20px_hsl(var(--ink)/0.12)] overflow-hidden">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-line/40 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-danger/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="mx-auto max-w-sm h-7 rounded-lg bg-muted/70 flex items-center justify-center text-[11px] text-muted-foreground font-mono">
                    connectus.vercel.app/feed
                  </div>
                </div>
              </div>
              {/* Content area */}
              <div className="p-6 lg:p-8 space-y-4 min-h-[260px] lg:min-h-[340px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00D4AE] to-[#0C6E8C]" />
                  <div>
                    <div className="h-3.5 w-32 rounded bg-muted/80" />
                    <div className="h-2.5 w-20 rounded bg-muted/50 mt-1.5" />
                  </div>
                  <div className="ml-auto">
                    <div className="h-8 w-24 rounded-full bg-[#00D4AE]/15 flex items-center justify-center text-[11px] font-medium text-[#00D4AE]">
                      Connected
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-line/40 p-4 space-y-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#0C6E8C]/20 to-[#00D4AE]/20" />
                      <div className="h-3 w-full rounded bg-muted/60" />
                      <div className="h-2.5 w-3/4 rounded bg-muted/40" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="flex-1 h-12 rounded-xl bg-muted/40 border border-line/30" />
                  <div className="h-12 w-12 rounded-xl bg-[#00D4AE]/20 flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-[#00D4AE]" />
                  </div>
                </div>
              </div>
            </div>
            {/* Glow behind */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-b from-[#00D4AE]/5 to-transparent blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS RIBBON ───────────────────────────────────────────── */}
      <section className="border-y border-line/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
                className="text-center"
              >
                <p className="text-4xl lg:text-5xl font-serif tracking-tight text-ink">{s.value}</p>
                <p className="mt-1.5 text-[13px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section id="features" className="section-pad">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-center mb-16 lg:mb-20"
          >
            <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-[#00D4AE] mb-4">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-[-0.02em] text-ink">
              Everything you need to
              <br />
              <span className="italic text-muted-foreground">build your network</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
                className="group relative rounded-2xl bg-surface border border-line/50 p-8 lg:p-10 card-hover overflow-hidden"
              >
                {/* Hover gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${f.color}08, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${f.color}12` }}
                  >
                    <f.icon className="h-6 w-6" style={{ color: f.color }} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-2">{f.title}</h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed">{f.desc}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-[#00D4AE] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="how-it-works" className="section-pad bg-[#0C1B2E] dark:bg-surface/40 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-[-20%] right-[-5%] w-[40%] h-[60%] rounded-full bg-[#00D4AE]/8 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-center mb-16 lg:mb-20"
          >
            <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-[#00D4AE] mb-4">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-[-0.02em] text-white dark:text-ink">
              Up and running in{" "}
              <span className="italic text-white/40 dark:text-muted-foreground">three steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#00D4AE]/20 to-transparent" />

            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.12 }}
                className="text-center relative"
              >
                <div className="mx-auto h-20 w-20 rounded-2xl bg-[#00D4AE]/10 border border-[#00D4AE]/20 flex items-center justify-center mb-6 relative z-10">
                  <span className="text-2xl font-serif text-[#00D4AE] tracking-tight">{s.n}</span>
                </div>
                <h3 className="text-lg font-semibold text-white dark:text-ink mb-2">{s.title}</h3>
                <p className="text-[14px] text-white/50 dark:text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
      <section id="testimonials" className="section-pad">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-center mb-16 lg:mb-20"
          >
            <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-[#00D4AE] mb-4">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-[-0.02em] text-ink">
              Loved by students{" "}
              <span className="italic text-muted-foreground">& alumni</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
                className="rounded-2xl border border-line/50 bg-surface p-8 flex flex-col card-hover"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#00D4AE] text-[#00D4AE]" />
                  ))}
                </div>
                <p className="text-[15px] text-ink leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-line/40">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00D4AE] to-[#0C6E8C] flex items-center justify-center text-[12px] font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-ink">{t.name}</p>
                    <p className="text-[12px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-[2rem] bg-[#0C1B2E] p-12 lg:p-20 overflow-hidden text-center">
            {/* Glow effects */}
            <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[80%] rounded-full bg-[#00D4AE]/15 blur-[80px]" />
            <div className="absolute bottom-[-20%] left-[-5%] w-[30%] h-[60%] rounded-full bg-[#0C6E8C]/20 blur-[60px]" />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }} />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-[-0.02em] text-white">
                Ready to connect
                <br />
                <span className="italic text-white/40">with your future?</span>
              </h2>
              <p className="mt-5 text-[16px] text-white/50 max-w-lg mx-auto leading-relaxed">
                Join hundreds of students and alumni already building meaningful
                professional relationships on ConnectUs.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="h-14 px-10 text-base rounded-full bg-[#00D4AE] hover:bg-[#00D4AE]/90 text-[#0C1B2E] font-semibold shadow-lg shadow-[#00D4AE]/20"
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

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-line/50 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Logo />
              <p className="text-[13px] text-muted-foreground">
                Bridging the gap between students and alumni.
              </p>
            </div>
            <div className="flex items-center gap-8 text-[13px] text-muted-foreground">
              <Link href="/login" className="hover:text-ink transition-colors">Login</Link>
              <Link href="/login" className="hover:text-ink transition-colors">Sign Up</Link>
              <a href="mailto:support@connectus.app" className="hover:text-ink transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-line/30 text-center">
            <p className="text-[12px] text-muted-foreground/50">
              © {new Date().getFullYear()} ConnectUs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
