"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, PartyPopper, ArrowRight } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { EASE } from "@/lib/utils";

const CHECKMARKS = [
  "Identity verified",
  "Bio added",
  "Education details saved",
  "Interests selected",
  "Username set",
  "Profile picture uploaded",
];

export default function CompletePage() {
  const router = useRouter();

  React.useEffect(() => {
    // Set the onboarding cookie so middleware doesn't redirect anymore
    document.cookie = "onboarding_complete=true; path=/; max-age=31536000; samesite=lax";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-6 py-12 relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[35%] rounded-full bg-accent/6 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 flex flex-col items-center text-center max-w-[480px]"
      >
        {/* Logo */}
        <Logo className="mb-8" />

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
          className="h-20 w-20 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center mb-6"
        >
          <PartyPopper className="h-9 w-9 text-accent" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
          className="font-serif text-[32px] tracking-[-0.02em] leading-tight text-ink"
        >
          You&apos;re all set!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
          className="mt-3 text-[15px] text-muted-foreground leading-relaxed"
        >
          Your profile is ready. Start exploring alumni, join events, and build your network.
        </motion.p>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.5 }}
          className="mt-8 w-full rounded-2xl bg-surface/80 backdrop-blur-sm border border-line/60 p-5"
        >
          <div className="space-y-2.5">
            {CHECKMARKS.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: EASE, delay: 0.6 + i * 0.08 }}
                className="flex items-center gap-2.5"
              >
                <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-accent" />
                </div>
                <span className="text-[13px] text-ink/80">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 1.1 }}
          onClick={() => router.push("/")}
          className="group mt-8 inline-flex items-center justify-center gap-2 h-12 px-10 rounded-xl bg-ink text-canvas text-[14px] font-medium transition-all hover:bg-ink/90 hover:shadow-lg"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
