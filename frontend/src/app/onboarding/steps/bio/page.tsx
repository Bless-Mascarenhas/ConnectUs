"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pen } from "lucide-react";
import {
  OnboardingShell,
  OnboardingCard,
  StepNavigation,
  FieldError,
} from "@/components/features/onboarding/onboarding-shell";
import { api } from "@/lib/api";
import { EASE } from "@/lib/utils";

export default function BioStep() {
  const router = useRouter();
  const [bio, setBio] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const charCount = bio.trim().length;
  const isValid = charCount >= 15 && charCount <= 300;

  const handleContinue = async () => {
    if (!isValid) {
      setError("Bio must be between 15 and 300 characters");
      return;
    }
    setSaving(true);
    try {
      await api("/api/users/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({ bio: bio.trim() }),
      });
      router.push("/onboarding/steps/education");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingShell
      step={2}
      title="Tell us about yourself"
      subtitle="A short bio helps others know who you are and what you're about."
    >
      <OnboardingCard>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
            <Pen className="h-3.5 w-3.5" />
            Your Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => { setBio(e.target.value); setError(""); }}
            rows={4}
            placeholder="I'm a second-year CS student passionate about building products that make a difference. Currently exploring AI/ML and looking to connect with alumni in the tech industry."
            autoFocus
            className="w-full resize-none rounded-xl bg-surface border border-line/80 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-foreground/50 outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-colors"
          />
          <div className="flex items-center justify-between mt-2">
            <FieldError error={error} />
            <span
              className={`text-[11px] tabular-nums ml-auto ${
                charCount > 300
                  ? "text-danger"
                  : charCount >= 15
                  ? "text-accent"
                  : "text-muted-foreground"
              }`}
            >
              {charCount}/300
            </span>
          </div>
        </motion.div>
      </OnboardingCard>

      <StepNavigation
        onBack={() => router.push("/onboarding/steps/identity")}
        onContinue={handleContinue}
        continueDisabled={!isValid}
        loading={saving}
      />
    </OnboardingShell>
  );
}
