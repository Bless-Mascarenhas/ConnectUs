"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Calendar } from "lucide-react";
import {
  OnboardingShell,
  OnboardingCard,
  StepNavigation,
  FieldError,
} from "@/components/features/onboarding/onboarding-shell";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { EASE } from "@/lib/utils";

export default function EducationStep() {
  const router = useRouter();
  const [major, setMajor] = React.useState("");
  const [gradYear, setGradYear] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(gradYear, 10);
  const isValidYear = !isNaN(yearNum) && yearNum >= 2000 && yearNum <= 2035;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!major.trim()) e.major = "Please enter your degree or major";
    if (!gradYear.trim()) e.gradYear = "Please enter your graduation year";
    else if (!isValidYear) e.gradYear = "Year must be between 2000 and 2035";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api("/api/users/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          major: major.trim(),
          gradYear: yearNum,
        }),
      });
      router.push("/onboarding/steps/interests");
    } catch {
      setErrors({ form: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingShell
      step={3}
      title="Your education"
      subtitle="This helps us match you with relevant alumni and opportunities."
    >
      <OnboardingCard>
        <div className="space-y-5">
          {/* Major / Degree */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0 }}
          >
            <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
              <GraduationCap className="h-3.5 w-3.5" />
              Degree / Major
            </label>
            <Input
              value={major}
              onChange={(e) => { setMajor(e.target.value); setErrors((er) => ({ ...er, major: "" })); }}
              placeholder="e.g. Computer Science, Business Administration"
              autoFocus
            />
            <FieldError error={errors.major} />
          </motion.div>

          {/* Graduation Year */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0.08 }}
          >
            <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
              <Calendar className="h-3.5 w-3.5" />
              Graduation Year
            </label>
            <Input
              type="number"
              value={gradYear}
              onChange={(e) => { setGradYear(e.target.value); setErrors((er) => ({ ...er, gradYear: "" })); }}
              placeholder={`e.g. ${currentYear + 2}`}
              min={2000}
              max={2035}
            />
            <FieldError error={errors.gradYear} />
          </motion.div>
        </div>

        {errors.form && (
          <p className="text-[13px] text-danger bg-danger/5 rounded-lg px-3 py-2 mt-4">
            {errors.form}
          </p>
        )}
      </OnboardingCard>

      <StepNavigation
        onBack={() => router.push("/onboarding/steps/bio")}
        onContinue={handleContinue}
        continueDisabled={!major.trim() || !isValidYear}
        loading={saving}
      />
    </OnboardingShell>
  );
}
