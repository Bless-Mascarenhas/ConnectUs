"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EASE } from "@/lib/utils";

interface ImageUploadProps {
  /** Supabase Storage bucket name */
  bucket: "avatars" | "event-covers" | "post-images";
  /** Path prefix inside the bucket (e.g. the user ID) */
  pathPrefix: string;
  /** Called with the public URL after successful upload */
  onUpload: (url: string) => void;
  /** Called when upload starts */
  onUploadStart?: () => void;
  /** Called when upload finishes (success or failure) */
  onUploadEnd?: () => void;
  /** Current image URL (for preview) */
  currentUrl?: string;
  /** Shape variant */
  variant?: "avatar" | "cover" | "inline" | "button";
  /** Optional class name */
  className?: string;
}

export function ImageUpload({
  bucket,
  pathPrefix,
  onUpload,
  onUploadStart,
  onUploadEnd,
  currentUrl,
  variant = "inline",
  className = "",
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    onUploadStart?.();

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${pathPrefix}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUpload(data.publicUrl);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
      onUploadEnd?.();
    }
  };

  const clear = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Avatar variant — circular overlay on existing avatar
  if (variant === "avatar") {
    return (
      <div className={`relative group cursor-pointer ${className}`} onClick={() => inputRef.current?.click()}>
        {preview ? (
          <img src={preview} alt="Avatar" className="h-full w-full rounded-full object-cover" />
        ) : (
          <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
          {uploading ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {error && <p className="absolute -bottom-5 left-0 text-[10px] text-danger whitespace-nowrap">{error}</p>}
      </div>
    );
  }

  // Cover variant — wide banner
  if (variant === "cover") {
    return (
      <div className={`relative ${className}`}>
        <div
          onClick={() => inputRef.current?.click()}
          className="h-32 rounded-xl border-2 border-dashed border-line/70 hover:border-accent/50 bg-muted/30 cursor-pointer flex items-center justify-center transition-colors overflow-hidden"
        >
          {preview ? (
            <>
              <img src={preview} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-ink/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                {uploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <ImagePlus className="h-5 w-5 text-white" />}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              <span className="text-[11px]">Add cover image</span>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {preview && !uploading && (
          <button
            onClick={(e) => { e.stopPropagation(); clear(); }}
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-ink/60 hover:bg-ink/80 flex items-center justify-center text-white transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
      </div>
    );
  }

  // Button variant - just an icon button that triggers upload, no internal preview
  if (variant === "button") {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); inputRef.current?.click(); }}
          className="h-8 w-8 rounded-full bg-surface/80 backdrop-blur-sm border border-line flex items-center justify-center hover:bg-surface transition-colors shadow-sm"
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-ink" /> : <ImagePlus className="h-3.5 w-3.5 text-ink" />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {error && <span className="absolute top-full mt-1 right-0 text-[11px] text-danger whitespace-nowrap bg-surface p-1 rounded border border-danger/20">{error}</span>}
      </div>
    );
  }

  // Inline variant — compact button for feed composer
  return (
    <div className={`inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-ink transition-colors px-2 py-1.5 rounded-lg hover:bg-muted/50"
        disabled={uploading}
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        Photo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="relative ml-2 h-8 w-8 rounded-lg overflow-hidden border border-line/60"
          >
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <button
              onClick={clear}
              className="absolute inset-0 bg-ink/0 hover:bg-ink/50 flex items-center justify-center transition-colors"
            >
              <X className="h-3 w-3 text-white opacity-0 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <span className="ml-2 text-[11px] text-danger">{error}</span>}
    </div>
  );
}
