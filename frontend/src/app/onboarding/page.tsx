"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Calendar, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { EASE } from "@/lib/utils";

const FEATURES = [
  {
    icon: Users,
    title: "Alumni Network",
    description: "Connect with graduates working at top companies across every industry.",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description: "Reach out for career advice, referrals, and mentorship — one message away.",
  },
  {
    icon: Calendar,
    title: "Exclusive Events",
    description: "Join panels, workshops, and networking mixers hosted by alumni.",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [showFeatures, setShowFeatures] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-6 py-12 relative overflow-hidden">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 flex flex-col items-center text-center max-w-[520px]"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        >
          <Logo className="mb-8 scale-150" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
          className="font-serif text-[36px] sm:text-[44px] tracking-[-0.03em] leading-[1.05] text-ink"
        >
          Welcome to{" "}
          <span className="relative">
            ConnectUs
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
              className="absolute -bottom-1 left-0 h-[3px] bg-accent/40 rounded-full"
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
          className="mt-4 text-[16px] sm:text-[17px] text-muted-foreground leading-relaxed max-w-[420px]"
        >
          Your gateway to alumni connections, mentorship, and career growth.
          We connect students with the people who&apos;ve walked the path before them.
        </motion.p>

        {/* Feature cards (toggleable) */}
        {showFeatures && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-8 w-full space-y-3 overflow-hidden"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: EASE, delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-surface/80 backdrop-blur-sm border border-line/60 text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-4.5 w-4.5 text-accent" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-ink">{f.title}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <button
            onClick={() => router.push("/onboarding/steps/identity")}
            className="group inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-ink text-canvas text-[14px] font-medium transition-all hover:bg-ink/90 hover:shadow-lg w-full sm:w-auto"
          >
            Let&apos;s Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-surface border border-line/80 text-ink text-[14px] font-medium transition-all hover:bg-muted/50 w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            {showFeatures ? "Got it!" : "What is ConnectUs?"}
          </button>
        </motion.div>

        {/* Trust indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.7 }}
          className="mt-8 text-[12px] text-muted-foreground/60"
        >
          Takes about 2 minutes to set up your profile
        </motion.p>
      </motion.div>
    </div>
  );
}
