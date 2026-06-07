"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import {
  OnboardingShell,
  OnboardingCard,
  StepNavigation,
} from "@/components/features/onboarding/onboarding-shell";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { EASE } from "@/lib/utils";

export default function AvatarStep() {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || "unknown";
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setPreview(data.publicUrl);

      // Save avatar URL immediately
      await api("/api/users/me/onboarding", {
        method: "PATCH",
        body: JSON.stringify({ avatar: data.publicUrl }),
      });
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Mark onboarding as complete
      await api("/api/users/me/onboarding", { method: "POST" });
      router.push("/onboarding/complete");
    } catch (err: any) {
      // If missing fields, show the error
      const body = err.message || "Failed to complete onboarding";
      setError(body);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingShell
      step={6}
      title="Add a profile picture"
      subtitle="Put a face to your name — profiles with photos get 3× more connections."
    >
      <OnboardingCard>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex flex-col items-center py-4"
        >
          {/* Avatar preview */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative h-32 w-32 rounded-full cursor-pointer group"
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile picture"
                className="h-full w-full rounded-full object-cover ring-4 ring-surface"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-muted/60 flex items-center justify-center ring-4 ring-surface">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-ink/0 group-hover:bg-ink/30 transition-colors flex items-center justify-center">
              {uploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <ImagePlus className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-4 text-[13px] text-accent font-medium hover:underline transition-colors"
          >
            {preview ? "Change photo" : "Choose a photo"}
          </button>

          {error && (
            <p className="text-[12px] text-danger mt-2">{error}</p>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </motion.div>
      </OnboardingCard>

      <StepNavigation
        onBack={() => router.push("/onboarding/steps/username")}
        onContinue={handleComplete}
        continueLabel="Finish Setup"
        loading={saving}
        showSkip={!preview}
        onSkip={handleComplete}
      />
    </OnboardingShell>
  );
}
