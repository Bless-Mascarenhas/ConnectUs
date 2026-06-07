"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AtSign, Check, X, Loader2 } from "lucide-react";
import {
  OnboardingShell,
  OnboardingCard,
  StepNavigation,
  FieldError,
} from "@/components/features/onboarding/onboarding-shell";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { EASE } from "@/lib/utils";

export default function UsernameStep() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [checking, setChecking] = React.useState(false);
  const [available, setAvailable] = React.useState<boolean | null>(null);
  const [reason, setReason] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const formatValid = /^[a-zA-Z0-9_]+$/.test(username) && username.length >= 3 && username.length <= 20;

  const checkUsername = React.useCallback(async (value: string) => {
    if (value.length < 3) {
      setAvailable(null);
      setReason("");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setAvailable(false);
      setReason("Only letters, numbers, and underscores allowed");
      return;
    }
    setChecking(true);
    try {
      const res = await api<{ available: boolean; reason?: string }>(
        `/api/users/check-username?username=${encodeURIComponent(value)}`
      );
      setAvailable(res.available);
      setReason(res.reason || "");
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }, []);

  const handleChange = (value: string) => {
    // Only allow valid characters while typing
    const sanitized = value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
    setUsername(sanitized);
    setError("");
    setAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkUsername(sanitized), 400);
  };

  const handleContinue = async () => {
    if (!formatValid || !available) {
      setError("Please choose a valid, available username");
      return;
    }
    setSaving(true);
    try {
      await api("/api/users/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({ username: username.toLowerCase() }),
      });
      router.push("/onboarding/steps/avatar");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingShell
      step={5}
      title="Pick a username"
      subtitle="This is your unique handle on ConnectUs — others will find you by this."
    >
      <OnboardingCard>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
            <AtSign className="h-3.5 w-3.5" />
            Username
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground">
              @
            </span>
            <Input
              value={username}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="rohit_gonsalves"
              className="pl-7 pr-10"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checking && (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              )}
              {!checking && available === true && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-accent" />
                </motion.div>
              )}
              {!checking && available === false && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-5 w-5 rounded-full bg-danger/10 flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-danger" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Status message */}
          {available === true && !checking && (
            <p className="text-[12px] text-accent mt-1.5 flex items-center gap-1">
              <Check className="h-3 w-3" />
              @{username} is available!
            </p>
          )}
          {available === false && !checking && (
            <p className="text-[12px] text-danger mt-1.5">
              {reason || `@${username} is already taken`}
            </p>
          )}

          <FieldError error={error} />

          <p className="text-[11px] text-muted-foreground mt-3">
            3–20 characters · letters, numbers, underscores only
          </p>
        </motion.div>
      </OnboardingCard>

      <StepNavigation
        onBack={() => router.push("/onboarding/steps/interests")}
        onContinue={handleContinue}
        continueDisabled={!formatValid || available !== true}
        loading={saving}
      />
    </OnboardingShell>
  );
}
