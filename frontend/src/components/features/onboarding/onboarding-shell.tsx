"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/layout/logo";
import { EASE } from "@/lib/utils";

/* ─── Step Progress ──────────────────────────────────────────────────── */

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  return (
    <div className="flex items-center gap-1.5 w-full max-w-[320px]">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: i < currentStep ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
            className="h-full bg-accent rounded-full"
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Onboarding Shell ───────────────────────────────────────────────── */

interface OnboardingShellProps {
  step?: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showProgress?: boolean;
}

export function OnboardingShell({
  step,
  totalSteps = 6,
  title,
  subtitle,
  children,
  showProgress = true,
}: OnboardingShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-canvas">
      {/* Top bar */}
      <div className="w-full px-6 py-5 flex items-center justify-between max-w-[680px]">
        <Logo />
        {showProgress && step !== undefined && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
              {step} of {totalSteps}
            </span>
            <StepProgress currentStep={step} totalSteps={totalSteps} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center w-full px-6 pt-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-[560px]"
        >
          <div className="mb-8">
            <h1 className="font-serif text-[28px] tracking-[-0.02em] leading-tight text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Onboarding Card ────────────────────────────────────────────────── */

interface OnboardingCardProps {
  children: React.ReactNode;
  className?: string;
}

export function OnboardingCard({ children, className = "" }: OnboardingCardProps) {
  return (
    <div
      className={`rounded-2xl bg-surface/80 backdrop-blur-xl border border-line/70 p-6 shadow-[0_1px_0_hsl(var(--line)/0.5)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Step Navigation ────────────────────────────────────────────────── */

interface StepNavigationProps {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  loading?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function StepNavigation({
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  loading = false,
  showBack = true,
  showSkip = false,
  onSkip,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between mt-8">
      <div>
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="text-[13px] text-muted-foreground hover:text-ink transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="text-[13px] text-muted-foreground hover:text-ink transition-colors"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={onContinue}
          disabled={continueDisabled || loading}
          className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-ink text-canvas text-[13px] font-medium transition-all hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
              Saving…
            </span>
          ) : (
            <>
              {continueLabel}
              <span className="text-[11px] opacity-70">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Field Error ────────────────────────────────────────────────────── */

export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-[12px] text-danger mt-1.5"
    >
      {error}
    </motion.p>
  );
}
