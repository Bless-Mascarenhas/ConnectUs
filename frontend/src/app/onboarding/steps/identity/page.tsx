"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, School, FileCheck, Upload, Loader2, Briefcase } from "lucide-react";
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

  const [role, setRole] = React.useState<"student" | "alumni" | "">("");
  const [name, setName] = React.useState("");
  const [university, setUniversity] = React.useState("");
  const [docUrl, setDocUrl] = React.useState<string | null>(null);
  const [docName, setDocName] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [verificationPassed, setVerificationPassed] = React.useState(false);

  const validatePreUpload = () => {
    const e: Record<string, string> = {};
    if (!role) e.role = "Please select if you are a student or an alumni";
    if (!name.trim() || name.trim().length < 2) e.name = "Please enter your full name";
    if (!university.trim() || university.trim().length < 2) e.university = "Please enter your college name";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    if (!validatePreUpload()) {
      return;
    }

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
    setVerificationPassed(false);
    let uploadedUrl = null;

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
      uploadedUrl = data.publicUrl;
      setDocUrl(uploadedUrl);
      setDocName(file.name);
    } catch (err: any) {
      setErrors((e) => ({ ...e, doc: err.message ?? "Upload failed" }));
      setUploading(false);
      return;
    }
    setUploading(false);

    // Now start verification immediately
    setVerifying(true);
    try {
      // First save the details required for verification
      await api("/api/users/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          role,
          name: name.trim(),
          university: university.trim(),
          verificationDocUrl: uploadedUrl,
        }),
      });

      // Then verify
      const result = await api<{status: string, reason: string}>("/api/users/me/verify-document", { method: "POST" });
      
      if (result.status === "rejected") {
        setErrors((e) => ({ ...e, doc: result.reason || "Document rejected. Please upload a valid document." }));
        setDocUrl(null);
        setDocName(null);
      } else {
        setVerificationPassed(true);
      }
    } catch (err: any) {
      setErrors((e) => ({ ...e, doc: "Failed to verify document. Please try again." }));
      setDocUrl(null);
      setDocName(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = async () => {
    if (!verificationPassed) {
      setErrors((e) => ({ ...e, doc: "Please upload a valid document to proceed" }));
      return;
    }
    
    setSaving(true);
    try {
      // Just to be sure we save everything correctly
      await api("/api/users/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({
          role,
          name: name.trim(),
          university: university.trim(),
          verificationDocUrl: docUrl,
        }),
      });

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
          {/* Role */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0 }}
          >
            <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
              <Briefcase className="h-3.5 w-3.5" />
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`py-2.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                  role === "student" ? "bg-accent/10 border-accent/50 text-accent shadow-sm" : "bg-surface border-line/70 text-muted-foreground hover:bg-muted/40"
                }`}
                onClick={() => { setRole("student"); setErrors(e => ({...e, role: ""})) }}
              >
                <span className="text-sm font-medium">Student</span>
              </button>
              <button
                className={`py-2.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                  role === "alumni" ? "bg-accent/10 border-accent/50 text-accent shadow-sm" : "bg-surface border-line/70 text-muted-foreground hover:bg-muted/40"
                }`}
                onClick={() => { setRole("alumni"); setErrors(e => ({...e, role: ""})) }}
              >
                <span className="text-sm font-medium">Alumni</span>
              </button>
            </div>
            <FieldError error={errors.role} />
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0.05 }}
          >
            <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
              <User className="h-3.5 w-3.5" />
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
              placeholder="e.g. Rohit Gonsalves"
            />
            <FieldError error={errors.name} />
          </motion.div>

          {/* University */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0.1 }}
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
            transition={{ duration: 0.35, ease: EASE, delay: 0.15 }}
          >
            <label className="flex items-center gap-2 text-[12px] font-medium text-ink/70 mb-2">
              <FileCheck className="h-3.5 w-3.5" />
              Verification Document
            </label>
            <p className="text-[12px] text-muted-foreground mb-3">
              Upload your college ID card, enrollment letter, or any document that proves your affiliation.
              Must fill above details first.
            </p>
            <div
              onClick={() => {
                if (!uploading && !verifying) {
                  if (validatePreUpload()) {
                    fileRef.current?.click();
                  }
                }
              }}
              className={`relative rounded-xl border-2 border-dashed transition-colors p-5 flex flex-col items-center gap-2 ${
                uploading || verifying ? "cursor-wait opacity-80" : "cursor-pointer"
              } ${
                verificationPassed
                  ? "border-accent/40 bg-accent/5"
                  : errors.doc
                  ? "border-danger/40 bg-danger/5"
                  : "border-line/70 hover:border-accent/40 bg-muted/20"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 text-accent animate-spin" />
                  <span className="text-[13px] text-accent font-medium">Uploading...</span>
                </>
              ) : verifying ? (
                <>
                  <Loader2 className="h-6 w-6 text-accent animate-spin" />
                  <span className="text-[13px] text-accent font-medium">Verifying Document via AI...</span>
                </>
              ) : verificationPassed ? (
                <>
                  <FileCheck className="h-6 w-6 text-accent" />
                  <span className="text-[13px] text-accent font-medium">
                    {docName || "Document verified!"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Click to replace
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[13px] text-ink/70 font-medium">
                    Click to upload & verify
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
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                    e.target.value = ""; // reset so they can re-upload same file if needed
                  }
                }}
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
        continueDisabled={!verificationPassed || verifying || uploading}
        loading={saving}
      />
    </OnboardingShell>
  );
}
