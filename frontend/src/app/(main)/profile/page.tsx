"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil, GraduationCap, Briefcase, MapPin, Mail, Check, Sparkles, X, Users, Calendar, MessageSquare, Bell,
} from "lucide-react";
import { PageHeader } from "@/components/features/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { EASE, gradientFor } from "@/lib/utils";
import type { Me } from "@/types";

const PREDEFINED_INTERESTS = [
  "Software Engineering", "Product Management", "Data Science", "Design",
  "Marketing", "Finance", "Consulting", "Entrepreneurship", "Research",
  "Sales", "Operations", "AI/ML", "Web3", "Healthcare", "Education",
  "Entertainment", "Food", "Real Estate", "Automotive", "Fintech", "SaaS"
];

export default function ProfilePage() {
  const [me, setMe] = React.useState<Me | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<Partial<Me>>({});
  const [saved, setSaved] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [addingExp, setAddingExp] = React.useState(false);
  const [newExp, setNewExp] = React.useState({ role: "", org: "", from: "", to: "" });
  const [addingInterest, setAddingInterest] = React.useState(false);
  const [showingOtherInterest, setShowingOtherInterest] = React.useState(false);
  const [otherInterest, setOtherInterest] = React.useState("");

  React.useEffect(() => {
    const supabase = createClient();
    Promise.all([
      api<Me>("/api/users/me"),
      supabase.auth.getSession(),
    ]).then(([m, { data: { session } }]) => {
      setMe(m); setDraft(m);
      setEmail(session?.user?.email ?? "");
    }).finally(() => setLoading(false));
  }, []);

  const startEdit = () => { if (me) setDraft(me); setEditing(true); };
  const cancel = () => { if (me) setDraft(me); setEditing(false); };
  const save = async () => {
    if (!me) return;
    try {
      const updated = await api<Me>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: draft.name,
          major: draft.major,
          bio: draft.bio,
          university: draft.university,
          coverUrl: draft.coverUrl,
          experience: draft.experience,
          interests: draft.interests,
        }),
      });
      setMe(updated);
      setDraft(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // keep editing open on failure
    }
  };

  const coverBackground = (editing ? draft.coverUrl : me?.coverUrl)
    ? `url(${(editing ? draft.coverUrl : me?.coverUrl)}) center/cover`
    : me ? gradientFor(me.name) : "linear-gradient(135deg,#5B7C5A,#A8C09A)";

  const calculateCompleteness = (p: Partial<Me> | null) => {
    if (!p) return 0;
    let score = 0;
    if (p.bio?.trim()) score += 25;
    if (p.university?.trim()) score += 25;
    if (p.experience && p.experience.length > 0) score += 25;
    if (p.interests && p.interests.length > 0) score += 25;
    return score;
  };

  const completeness = calculateCompleteness(editing ? draft : me);
  const nextStep = !me?.bio ? "add a short bio" : !me?.university ? "add your university" : (!me?.experience || me.experience.length === 0) ? "add your experience" : "add your interests";

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-14 max-w-[1100px] mx-auto">
      <PageHeader
        eyebrow="Your profile"
        title={<>How others <span className="italic text-ink/40">see you</span></>}
        description="Keep this fresh — sharper profiles get sharper introductions."
        right={
          editing ? (
            <>
              <Button variant="ghost" onClick={cancel}><X className="h-4 w-4" />Cancel</Button>
              <Button variant="accent" onClick={save}><Check className="h-4 w-4" />Save changes</Button>
            </>
          ) : (
            <Button variant="outline" onClick={startEdit}>
              <Pencil className="h-3.5 w-3.5" />Edit profile
            </Button>
          )
        }
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
            <Check className="h-3.5 w-3.5" /> Profile saved
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="rounded-2xl bg-surface border border-line/70 overflow-hidden"
          >
            <div className="h-32 relative group" style={{ background: coverBackground }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/40" />
              {editing && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageUpload
                    bucket="avatars"
                    pathPrefix={`${me?.id}-cover`}
                    currentUrl={draft.coverUrl || ""}
                    variant="button"
                    onUpload={async (url) => {
                      setDraft(d => ({ ...d, coverUrl: url }));
                    }}
                  />
                </div>
              )}
            </div>
            <div className="px-6 pb-6 -mt-12">
              {loading || !me ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : editing ? (
                <ImageUpload
                  bucket="avatars"
                  pathPrefix={me.id}
                  currentUrl={me.avatar}
                  variant="avatar"
                  className="h-24 w-24"
                  onUpload={async (url) => {
                    await api("/api/users/me", {
                      method: "PATCH",
                      body: JSON.stringify({ avatar: url }),
                    });
                    setMe((prev) => prev ? { ...prev, avatar: url } : prev);
                    setDraft((d) => ({ ...d, avatar: url }));
                  }}
                />
              ) : (
                <Avatar src={me.avatar} name={me.name} size={96} className="ring-4 ring-surface" online />
              )}
              <div className="mt-4">
                {loading || !me ? (
                  <>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </>
                ) : editing ? (
                  <div className="space-y-2 max-w-md">
                    <Input
                      value={draft.name ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Your name"
                      className="h-10 text-lg font-medium"
                    />
                    <Input
                      value={draft.major ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, major: e.target.value }))}
                      placeholder="Major"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-display text-3xl text-ink">{me.name}</h2>
                    <p className="mt-1 text-[14px] text-muted-foreground">
                      {me.major} · Class of {me.gradYear}
                    </p>
                  </>
                )}
                {!editing && me && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant="accent" className="capitalize">
                      <span className="h-1 w-1 rounded-full bg-accent" /> {me.role}
                    </Badge>
                    <Badge variant="outline">
                      <GraduationCap className="h-3 w-3" /> {me.university}
                    </Badge>
                    <Badge variant="outline">
                      <MapPin className="h-3 w-3" /> {me.university || "Location not set"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* About */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
            className="rounded-2xl bg-surface border border-line/70 p-6"
          >
            <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">About</h3>
            {loading || !me ? (
              <Skeleton className="h-20" />
            ) : editing ? (
              <textarea
                value={draft.bio ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                rows={4}
                placeholder="A sentence or two — what you're working on, what you care about."
                className="w-full resize-none rounded-xl bg-surface border border-line/80 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-foreground/70 outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-colors"
              />
            ) : (
              <p className="text-[15px] leading-relaxed text-ink/85">{me.bio}</p>
            )}
          </motion.section>

          {/* Interests */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
            className="rounded-2xl bg-surface border border-line/70 p-6"
          >
            <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">Looking to learn</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {((editing ? draft.interests : me?.interests) || []).map((tag) => (
                <Badge key={tag} variant="default" className="flex items-center gap-1 group">
                  {tag}
                  {editing && (
                    <button 
                      onClick={() => setDraft(d => ({ ...d, interests: d.interests?.filter(t => t !== tag) }))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-danger"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {editing && !addingInterest && (
                <button 
                  onClick={() => setAddingInterest(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-line text-muted-foreground px-2 py-1 text-[11px] hover:text-ink hover:border-line"
                >
                  + Add interest
                </button>
              )}
            </div>

            <AnimatePresence>
              {addingInterest && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-muted/30 p-4 rounded-xl border border-line overflow-hidden space-y-3"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {PREDEFINED_INTERESTS.filter(t => !(draft.interests || []).includes(t)).map(tag => (
                      <button
                        key={tag}
                        onClick={() => setDraft(d => ({ ...d, interests: [...(d.interests || []), tag] }))}
                        className="rounded-full bg-surface border border-line px-2.5 py-1 text-[12px] text-ink hover:bg-line/50 hover:border-line transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowingOtherInterest(!showingOtherInterest)}
                      className="rounded-full bg-surface border border-dashed border-line px-2.5 py-1 text-[12px] text-accent hover:border-accent hover:bg-accent/5 transition-colors"
                    >
                      Others...
                    </button>
                  </div>

                  {showingOtherInterest && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-surface rounded-lg border border-line">
                      <Input 
                        value={otherInterest} 
                        onChange={e => setOtherInterest(e.target.value)} 
                        placeholder="Type a custom interest..." 
                        className="h-8 text-[13px]"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && otherInterest.trim()) {
                            e.preventDefault();
                            setDraft(d => ({ ...d, interests: [...(d.interests || []), otherInterest.trim()] }));
                            setOtherInterest("");
                            setShowingOtherInterest(false);
                          }
                        }}
                      />
                      <Button 
                        variant="accent" 
                        size="sm" 
                        className="h-8 shrink-0"
                        onClick={() => {
                          if (otherInterest.trim()) {
                            setDraft(d => ({ ...d, interests: [...(d.interests || []), otherInterest.trim()] }));
                            setOtherInterest("");
                            setShowingOtherInterest(false);
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-line/50">
                    <Button variant="ghost" size="sm" onClick={() => { setAddingInterest(false); setShowingOtherInterest(false); }}>Close</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {((editing ? draft.interests : me?.interests) || []).length === 0 && !addingInterest && (
              <p className="text-[13px] text-muted-foreground py-2 italic">No interests added yet.</p>
            )}
          </motion.section>

          {/* Experience */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.15 }}
            className="rounded-2xl bg-surface border border-line/70 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Experience</h3>
              {editing && !addingExp && (
                <button onClick={() => setAddingExp(true)} className="text-[11px] text-accent hover:underline">+ Add experience</button>
              )}
            </div>
            
            <AnimatePresence>
              {addingExp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-muted/30 p-4 rounded-xl border border-line overflow-hidden space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-ink mb-1.5 block">Role / Title</label>
                      <Input value={newExp.role} onChange={e => setNewExp(n => ({...n, role: e.target.value}))} placeholder="e.g. Software Engineer" className="h-8 text-[13px]" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-ink mb-1.5 block">Organization / Course</label>
                      <Input value={newExp.org} onChange={e => setNewExp(n => ({...n, org: e.target.value}))} placeholder="e.g. Linear" className="h-8 text-[13px]" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-ink mb-1.5 block">From Date</label>
                      <Input value={newExp.from} onChange={e => setNewExp(n => ({...n, from: e.target.value}))} placeholder="e.g. Summer 2025" className="h-8 text-[13px]" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-ink mb-1.5 block">To Date</label>
                      <Input value={newExp.to} onChange={e => setNewExp(n => ({...n, to: e.target.value}))} placeholder="e.g. Present" className="h-8 text-[13px]" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={() => { setAddingExp(false); setNewExp({role:"",org:"",from:"",to:""}); }}>Cancel</Button>
                    <Button variant="accent" size="sm" onClick={() => {
                      if (newExp.role && newExp.org && newExp.from) {
                        setDraft(d => ({ ...d, experience: [...(d.experience || []), newExp] }));
                        setAddingExp(false);
                        setNewExp({role:"",org:"",from:"",to:""});
                      }
                    }}>Add to profile</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative pl-6">
              <span className="absolute top-1.5 bottom-1.5 left-[7px] w-px bg-line" />
              {((editing ? draft.experience : me?.experience) || []).map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, ease: EASE, delay: 0.2 + i * 0.05 }}
                  className="relative pb-5 last:pb-0 group"
                >
                  <span className="absolute -left-[22px] top-1.5 h-3.5 w-3.5 rounded-full bg-canvas border-2 border-accent" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-ink">{e.role}</p>
                      <p className="text-[13px] text-muted-foreground">{e.org}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{e.from} — {e.to}</p>
                    </div>
                    {editing && (
                      <button
                        onClick={() => setDraft(d => ({ ...d, experience: d.experience?.filter((_, idx) => idx !== i) }))}
                        className="text-[11px] text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-danger/10 rounded"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {((editing ? draft.experience : me?.experience) || []).length === 0 && !addingExp && (
                <p className="text-[13px] text-muted-foreground py-2 italic">No experience added yet.</p>
              )}
            </div>
          </motion.section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
          >
            <Card className="bg-surface border-line/70">
              <CardContent className="pt-5 pb-5">
                <h3 className="text-[13px] font-medium text-ink mb-3 flex items-center justify-between">
                  Profile completeness
                  {completeness === 100 && (
                    <motion.span 
                      initial={{ scale: 0, rotate: -45 }} 
                      animate={{ scale: 1, rotate: 0 }} 
                      className="text-accent"
                    >
                      🏆
                    </motion.span>
                  )}
                </h3>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completeness}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full ${completeness === 100 ? 'bg-accent' : 'bg-ink/70'} rounded-full`}
                  />
                </div>
                {completeness < 100 ? (
                  <p className="text-[13px] text-muted-foreground">
                    <span className="text-ink font-medium">{completeness}%</span> — {nextStep} to round it out.
                  </p>
                ) : (
                  <p className="text-[13px] text-accent font-medium">
                    100% complete! You're looking sharp.
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-line/50">
                  <Link href="/alumni" className="text-[13px] font-medium text-ink hover:text-accent transition-colors flex items-center">
                    Browse alumni <span className="ml-1">→</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.08 }}
          >
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">
                  <Sparkles className="inline h-3 w-3 mr-1 -mt-0.5 text-accent" /> Your stats
                </h3>
                <div className="space-y-3">
                  {loading || !me ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6" />)
                  ) : (
                    <>
                      <StatRow icon={Users} label="Connections" value={me.stats.connections} />
                      <StatRow icon={Bell} label="Pending requests" value={me.stats.pending} />
                      <StatRow icon={Calendar} label="Events attending" value={me.stats.events} />
                      <StatRow icon={MessageSquare} label="Unread messages" value={me.stats.unread} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.12 }}
          >
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">Contact</h3>
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex items-center gap-2 text-ink/80">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {email || "No email set"}
                  </div>
                  <div className="flex items-center gap-2 text-ink/80">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    Available for coffee chats
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2 text-[13px] text-ink/80">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </span>
      <span className="text-[14px] font-medium text-ink tabular-nums">{value}</span>
    </div>
  );
}
