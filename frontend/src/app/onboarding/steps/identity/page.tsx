"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, School, FileCheck, Upload, Loader2 } from "lucide-react";
import {
  OnboardingShell,
  OnboardingCard,
  StepNavigation,
  FieldError,
} from "@/components/features/onboarding/onboarding-shell";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { EASE } from "@/lib/utils";

export default function IdentityStep() {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [name, setName] = React.useState("");
  const [university, setUniversity] = React.useState("");
  const [docUrl, setDocUrl] = React.useState<string | null>(null);
  const [docName, setDocName] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = "Please enter your full name (at least 2 characters)";
    if (!university.trim() || university.trim().length < 2) e.university = "Please enter your college name";
    if (!docUrl) e.doc = "Please upload a verification document";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setErrors((e) => ({ ...e, doc: "Only JPG, PNG, WebP, or PDF files are allowed" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, doc: "File must be under 5 MB" }));
      return;
    }

    setUploading(true);
    setErrors((e) => ({ ...e, doc: "" }));

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || "unknown";
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${userId}/verification-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setDocUrl(data.publicUrl);
      setDocName(file.name);
    } catch (err: any) {
      setErrors((e) => ({ ...e, doc: err.message ?? "Upload failed" }));
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api("/api/users/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          university: university.trim(),
          verificationDocUrl: docUrl,
        }),
      });

      // Fire and forget verification process in the background
      api("/api/users/me/verify-document", { method: "POST" }).catch((err) =>
        console.error("Background verification error:", err)
      );

      router.push("/onboarding/steps/bio");
    } catch {
      setErrors({ form: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingShell
      step={1}
      title="Let's verify who you are"
      subtitle="We need a few details to confirm your identity and college affiliation."
    >
      <OnboardingCard>
        <div className="space-y-5">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0 }}
          >
            <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
              <User className="h-3.5 w-3.5" />
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
              placeholder="e.g. Rohit Gonsalves"
              autoFocus
            />
            <FieldError error={errors.name} />
          </motion.div>

          {/* University */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0.08 }}
          >
            <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
              <School className="h-3.5 w-3.5" />
              College / University
            </label>
            <Input
              value={university}
              onChange={(e) => { setUniversity(e.target.value); setErrors((er) => ({ ...er, university: "" })); }}
              placeholder="e.g. St. Xavier's College"
            />
            <FieldError error={errors.university} />
          </motion.div>

          {/* Verification Doc */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0.16 }}
          >
            <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
              <FileCheck className="h-3.5 w-3.5" />
              Verification Document
            </label>
            <p className="text-[12px] text-muted-foreground mb-3">
              Upload your college ID card, enrollment letter, or any document that proves your affiliation.
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-colors p-5 flex flex-col items-center gap-2 ${
                docUrl
                  ? "border-accent/40 bg-accent/5"
                  : errors.doc
                  ? "border-danger/40 bg-danger/5"
                  : "border-line/70 hover:border-accent/40 bg-muted/20"
              }`}
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 text-accent animate-spin" />
              ) : docUrl ? (
                <>
                  <FileCheck className="h-6 w-6 text-accent" />
                  <span className="text-[13px] text-accent font-medium">
                    {docName || "Document uploaded"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Click to replace
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[13px] text-ink/70 font-medium">
                    Click to upload
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    PDF, JPG, PNG, or WebP — max 5 MB
                  </span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </div>
            <FieldError error={errors.doc} />
          </motion.div>
        </div>

        {errors.form && (
          <p className="text-[13px] text-danger bg-danger/5 rounded-lg px-3 py-2 mt-4">
            {errors.form}
          </p>
        )}
      </OnboardingCard>

      <StepNavigation
        onBack={() => router.push("/onboarding")}
        onContinue={handleContinue}
        continueDisabled={!name.trim() || !university.trim() || !docUrl}
        loading={saving}
      />
    </OnboardingShell>
  );
}
