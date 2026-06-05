"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import {
  User, Bell, Shield, Palette, Sun, Moon, Monitor, Check, Trash2, LogOut, Sparkles, Lock, AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/features/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EASE } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Me } from "@/types";

type Section = "account" | "notifications" | "privacy" | "appearance";

const SECTIONS: { id: Section; label: string; icon: any; desc: string }[] = [
  { id: "account", label: "Account", icon: User, desc: "Name, email, university" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Email and in-app alerts" },
  { id: "privacy", label: "Privacy", icon: Shield, desc: "Visibility and discovery" },
  { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme and density" },
];

export default function SettingsPage() {
  const [section, setSection] = React.useState<Section>("account");
  const [saved, setSaved] = React.useState(false);

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-14 max-w-[1100px] mx-auto">
      <PageHeader
        eyebrow="Settings"
        title={<>Preferences & <span className="italic text-ink/40">controls</span></>}
        description="Tune how ConnectUs looks, who can find you, and what shows up in your inbox."
      />

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-soft border border-accent/20 px-3 py-1.5 text-[12px] text-accent"
          >
            <Check className="h-3.5 w-3.5" /> Saved
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10">
        {/* Sidebar nav */}
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-2 px-2 md:m-0 md:p-0">
          {SECTIONS.map((s) => {
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`relative shrink-0 md:w-full inline-flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                  active ? "text-ink" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="settings-active"
                    transition={{ duration: 0.22, ease: EASE }}
                    className="absolute inset-0 rounded-lg bg-muted"
                  />
                )}
                <s.icon className="relative h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="relative font-medium">{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Section content */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="space-y-6"
            >
              {section === "account" && <AccountSection onSave={flash} />}
              {section === "notifications" && <NotificationsSection onSave={flash} />}
              {section === "privacy" && <PrivacySection onSave={flash} />}
              {section === "appearance" && <AppearanceSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <header className="pb-4 border-b border-line/60">
      <h2 className="text-display text-2xl text-ink">{title}</h2>
      <p className="mt-1 text-[13px] text-muted-foreground">{blurb}</p>
    </header>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-2 md:gap-6 py-4 border-b border-line/40 last:border-0">
      <div>
        <p className="text-[13px] font-medium text-ink">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-accent" : "bg-line"}`}
    >
      <motion.span
        animate={{ x: on ? 18 : 2 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="absolute top-[2px] h-4 w-4 rounded-full bg-canvas shadow-sm"
      />
    </button>
  );
}

function AccountSection({ onSave }: { onSave: () => void }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [university, setUniversity] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Change password
  const [newPw, setNewPw] = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [pwSaving, setPwSaving] = React.useState(false);
  const [pwMsg, setPwMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteInput, setDeleteInput] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    Promise.all([
      api<Me>("/api/users/me"),
      supabase.auth.getSession(),
    ]).then(([me, { data: { session } }]) => {
      setName(me.name);
      setUniversity(me.university);
      setEmail(session?.user?.email ?? "");
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name, university }),
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPw.length < 6) { setPwMsg({ ok: false, text: "Password must be at least 6 characters." }); return; }
    if (newPw !== confirmPw) { setPwMsg({ ok: false, text: "Passwords do not match." }); return; }
    setPwSaving(true);
    setPwMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) { setPwMsg({ ok: false, text: error.message }); }
      else { setPwMsg({ ok: true, text: "Password updated successfully." }); setNewPw(""); setConfirmPw(""); }
    } finally {
      setPwSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api("/api/users/me", { method: "DELETE" });
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <SectionHeader title="Account" blurb="The basics other people can see and how we reach you." />
      <div>
        <Field label="Full name" hint="Shown on your profile and posts.">
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
        </Field>
        <Field label="Email" hint="Managed by your login provider.">
          <Input value={email} type="email" disabled />
        </Field>
        <Field label="University" hint="Used to surface local events and alumni.">
          <Input value={university} onChange={(e) => setUniversity(e.target.value)} disabled={loading} />
        </Field>
      </div>
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Changes save instantly across devices.
        </span>
        <Button variant="accent" size="sm" onClick={save} disabled={saving || loading}>
          {saving ? "Saving\u2026" : "Save changes"}
        </Button>
      </div>

      {/* Change password */}
      <div className="mt-10 rounded-2xl border border-line/60 bg-surface p-5">
        <h3 className="text-[13px] font-medium text-ink inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Change password
        </h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input type="password" placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          <Input type="password" placeholder="Confirm password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
        </div>
        {pwMsg && (
          <p className={`mt-2 text-[12px] ${pwMsg.ok ? "text-success" : "text-danger"}`}>{pwMsg.text}</p>
        )}
        <div className="mt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={changePassword} disabled={pwSaving || !newPw}>
            {pwSaving ? "Updating\u2026" : "Update password"}
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-6 rounded-2xl border border-danger/20 bg-danger/5 p-5">
        <h3 className="text-[13px] font-medium text-ink">Danger zone</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Sign out everywhere or permanently delete your account. Both are immediate.
        </p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-3.5 w-3.5" /> Sign out</Button>
          <Button variant="outline" size="sm" className="text-danger border-danger/30 hover:bg-danger/10" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete account
          </Button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-surface border border-danger/30 shadow-2xl p-6"
            >
              <div className="flex items-center gap-2 text-danger mb-3">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-display text-xl text-ink">Delete your account?</h2>
              </div>
              <p className="text-[13px] text-muted-foreground">
                This action is <strong className="text-ink">permanent and irreversible</strong>. All your data, connections, messages, and posts will be deleted forever.
              </p>
              <p className="mt-3 text-[12px] text-muted-foreground">
                Type <strong className="text-ink font-mono">DELETE</strong> below to confirm:
              </p>
              <Input
                className="mt-2"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-danger border-danger/30 hover:bg-danger/10"
                  disabled={deleteInput !== "DELETE" || deleting}
                  onClick={deleteAccount}
                >
                  {deleting ? "Deleting\u2026" : "Delete permanently"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationsSection({ onSave }: { onSave: () => void }) {
  const [s, setS] = React.useState({
    msgs: true,
    mentions: true,
    events: true,
    weekly: false,
    marketing: false,
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    api<Me>("/api/users/me")
      .then((me) => { if (me.preferences) setS(me.preferences); })
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof typeof s, v: boolean) => setS({ ...s, [k]: v });

  const savePrefs = async () => {
    setSaving(true);
    try {
      await api("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ preferences: s }),
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionHeader title="Notifications" blurb="Pick what's worth interrupting you for." />
      <div>
        <Field label="New messages" hint="Get a ping when someone replies in your inbox.">
          <Toggle on={s.msgs} onChange={(v) => set("msgs", v)} />
        </Field>
        <Field label="Mentions and reactions" hint="When someone tags you or reacts to a post.">
          <Toggle on={s.mentions} onChange={(v) => set("mentions", v)} />
        </Field>
        <Field label="Event reminders" hint="A nudge an hour before things you've RSVP'd to.">
          <Toggle on={s.events} onChange={(v) => set("events", v)} />
        </Field>
        <Field label="Weekly digest" hint="A Sunday recap of what your network did.">
          <Toggle on={s.weekly} onChange={(v) => set("weekly", v)} />
        </Field>
        <Field label="Product updates" hint="Occasional emails about new ConnectUs features.">
          <Toggle on={s.marketing} onChange={(v) => set("marketing", v)} />
        </Field>
      </div>
      <div className="flex justify-end pt-2">
        <Button variant="accent" size="sm" onClick={savePrefs} disabled={saving || loading}>
          {saving ? "Saving\u2026" : "Save preferences"}
        </Button>
      </div>
    </>
  );
}

function PrivacySection({ onSave }: { onSave: () => void }) {
  const [visibility, setVisibility] = React.useState<"public" | "alumni" | "private">("alumni");
  const [s, setS] = React.useState({ search: true, online: true, dm: true });
  return (
    <>
      <SectionHeader title="Privacy" blurb="Who can find you, message you, and see when you're around." />
      <Field label="Profile visibility" hint="Who can view your full profile and contact info.">
        <div className="grid grid-cols-3 gap-2">
          {(["public", "alumni", "private"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisibility(v)}
              className={`relative rounded-xl border px-3 py-3 text-left capitalize transition-all ${
                visibility === v
                  ? "border-accent/50 bg-accent-soft"
                  : "border-line/70 hover:border-line"
              }`}
            >
              <p className="text-[13px] font-medium text-ink">{v}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {v === "public" && "Anyone, including search engines."}
                {v === "alumni" && "Alumni and verified students."}
                {v === "private" && "Only direct connections."}
              </p>
              {visibility === v && (
                <motion.span
                  layoutId="vis-tick"
                  className="absolute top-2 right-2 h-4 w-4 rounded-full bg-accent flex items-center justify-center"
                >
                  <Check className="h-2.5 w-2.5 text-accent-foreground" strokeWidth={3} />
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </Field>
      <div>
        <Field label="Appear in search" hint="Let people find you in the alumni directory.">
          <Toggle on={s.search} onChange={(v) => setS({ ...s, search: v })} />
        </Field>
        <Field label="Show online status" hint="Display the green dot when you're active.">
          <Toggle on={s.online} onChange={(v) => setS({ ...s, online: v })} />
        </Field>
        <Field label="Allow DMs from anyone" hint="If off, only your connections can message you.">
          <Toggle on={s.dm} onChange={(v) => setS({ ...s, dm: v })} />
        </Field>
      </div>
      <div className="flex justify-end pt-2">
        <Button variant="accent" size="sm" onClick={onSave}>Save changes</Button>
      </div>
    </>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const options = [
    { v: "light", label: "Light", icon: Sun },
    { v: "dark", label: "Dark", icon: Moon },
    { v: "system", label: "System", icon: Monitor },
  ];
  return (
    <>
      <SectionHeader title="Appearance" blurb="Theme and visual density." />
      <Field label="Theme" hint="System follows your OS setting.">
        <div className="grid grid-cols-3 gap-2">
          {options.map((o) => {
            const active = mounted && theme === o.v;
            return (
              <button
                key={o.v}
                onClick={() => setTheme(o.v)}
                className={`relative rounded-xl border px-3 py-4 flex flex-col items-center gap-2 transition-all ${
                  active ? "border-accent/50 bg-accent-soft" : "border-line/70 hover:border-line"
                }`}
              >
                <o.icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                <span className="text-[12px] font-medium text-ink">{o.label}</span>
                {active && (
                  <motion.span
                    layoutId="theme-tick"
                    className="absolute top-2 right-2 h-4 w-4 rounded-full bg-accent flex items-center justify-center"
                  >
                    <Check className="h-2.5 w-2.5 text-accent-foreground" strokeWidth={3} />
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Accent" hint="The palette is hand-tuned — sage runs across the product.">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-accent ring-2 ring-accent/30" />
          <span className="text-[12px] text-muted-foreground">Sage · #5B7C5A</span>
        </div>
      </Field>
    </>
  );
}
