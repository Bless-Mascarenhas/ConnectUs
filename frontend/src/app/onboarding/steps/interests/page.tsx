"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import {
  OnboardingShell,
  OnboardingCard,
  StepNavigation,
  FieldError,
} from "@/components/features/onboarding/onboarding-shell";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { EASE } from "@/lib/utils";

const PREDEFINED_INTERESTS = [
  "Software Engineering", "Product Management", "Data Science", "Design",
  "Marketing", "Finance", "Consulting", "Entrepreneurship", "Research",
  "Sales", "Operations", "AI/ML", "Web3", "Healthcare", "Education",
  "Entertainment", "Food", "Real Estate", "Automotive", "Fintech", "SaaS",
];

export default function InterestsStep() {
  const router = useRouter();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [showOther, setShowOther] = React.useState(false);
  const [otherValue, setOtherValue] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const toggle = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
    setError("");
  };

  const addCustom = () => {
    const trimmed = otherValue.trim();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed]);
      setOtherValue("");
      setShowOther(false);
      setError("");
    }
  };

  const remove = (interest: string) => {
    setSelected((prev) => prev.filter((i) => i !== interest));
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      setError("Please select at least one interest");
      return;
    }
    setSaving(true);
    try {
      await api("/api/users/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({ interests: selected }),
      });
      router.push("/onboarding/steps/username");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingShell
      step={4}
      title="What are you into?"
      subtitle="Pick topics you're passionate about — we'll use these to personalize your experience."
    >
      <OnboardingCard>
        {/* Selected tags */}
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-1.5 mb-5 pb-5 border-b border-line/50"
          >
            {selected.map((tag) => (
              <motion.span
                key={tag}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/20 px-2.5 py-1 text-[12px] font-medium text-accent"
              >
                {tag}
                <button
                  onClick={() => remove(tag)}
                  className="hover:text-danger transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Predefined interests grid */}
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_INTERESTS.map((interest, i) => {
            const isSelected = selected.includes(interest);
            return (
              <motion.button
                key={interest}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE, delay: i * 0.02 }}
                onClick={() => toggle(interest)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium border transition-all ${
                  isSelected
                    ? "bg-accent text-accent-fg border-accent shadow-sm"
                    : "bg-surface border-line/80 text-ink hover:border-accent/40 hover:bg-accent/5"
                }`}
              >
                {interest}
              </motion.button>
            );
          })}

          {/* Custom interest */}
          {!showOther ? (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: EASE, delay: PREDEFINED_INTERESTS.length * 0.02 }}
              onClick={() => setShowOther(true)}
              className="rounded-full px-3 py-1.5 text-[12px] font-medium border border-dashed border-accent/40 text-accent hover:bg-accent/5 transition-colors"
            >
              + Others…
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              className="flex items-center gap-2"
            >
              <Input
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                placeholder="Type a custom interest"
                className="h-8 text-[12px] w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addCustom(); }
                  if (e.key === "Escape") setShowOther(false);
                }}
              />
              <button
                onClick={addCustom}
                className="text-[12px] text-accent font-medium hover:underline shrink-0"
              >
                Add
              </button>
            </motion.div>
          )}
        </div>

        <FieldError error={error} />

        <p className="text-[11px] text-muted-foreground mt-4">
          <Sparkles className="inline h-3 w-3 mr-1 -mt-0.5" />
          Selected: {selected.length} {selected.length === 1 ? "interest" : "interests"}
          {selected.length === 0 && " — pick at least 1"}
        </p>
      </OnboardingCard>

      <StepNavigation
        onBack={() => router.push("/onboarding/steps/education")}
        onContinue={handleContinue}
        continueDisabled={selected.length === 0}
        loading={saving}
      />
    </OnboardingShell>
  );
}
