"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Star, Clock, Check, X, Sparkles, Calendar, ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/features/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { EASE } from "@/lib/utils";
import type { Alumnus } from "@/types";

interface Mentor {
  alumnusId: string;
  hourlyPrice: number | null;
  rating: number;
  sessionsCompleted: number;
  availability: string[];
  alumnus: Alumnus;
}

interface Booking {
  id: string;
  mentorId: string;
  slot: string;
  goal: string;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: string;
  mentor: Alumnus;
}

type Tab = "mentors" | "bookings";

export default function MentorshipPage() {
  const [tab, setTab] = React.useState<Tab>("mentors");
  const [mentors, setMentors] = React.useState<Mentor[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Mentor | null>(null);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [goal, setGoal] = React.useState("");
  const [booking, setBooking] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const refresh = React.useCallback(() => {
    return Promise.all([
      api<Mentor[]>("/api/mentorship/mentors"),
      api<Booking[]>("/api/mentorship/bookings"),
    ]).then(([m, b]) => {
      setMentors(m);
      setBookings(b);
    });
  }, []);

  React.useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const open = (m: Mentor) => {
    setSelected(m);
    setPicked(m.availability[0] ?? null);
    setGoal("");
    setSuccess(false);
  };
  const close = () => {
    setSelected(null);
    setSuccess(false);
  };

  const submit = async () => {
    if (!selected || !picked) return;
    setBooking(true);
    try {
      await api("/api/mentorship/book", {
        method: "POST",
        body: JSON.stringify({ mentorId: selected.alumnusId, slot: picked, goal }),
      });
      await refresh();
      setSuccess(true);
      setTimeout(() => {
        close();
        setTab("bookings");
      }, 1400);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-14 max-w-[1280px] mx-auto">
      <PageHeader
        eyebrow="Mentorship"
        title={<>Book a <span className="italic text-ink/40">mentor</span></>}
        description="Alumni who volunteer their time for 1:1 sessions. Pick a slot, share a goal, and we'll handle the rest."
        right={
          <div className="inline-flex items-center gap-1 rounded-lg border border-line/80 bg-surface p-0.5">
            {(["mentors", "bookings"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative h-9 px-3 text-[12px] font-medium rounded-md capitalize transition-colors ${
                  tab === t ? "text-ink" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="mentor-tab"
                    transition={{ duration: 0.22, ease: EASE }}
                    className="absolute inset-0 rounded-md bg-muted"
                  />
                )}
                <span className="relative">
                  {t === "mentors" ? "Browse mentors" : `My bookings${bookings.length ? ` · ${bookings.length}` : ""}`}
                </span>
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {tab === "mentors" ? (
            <motion.div
              key="mentors"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[260px]" />)
              ) : (
                mentors.map((m, i) => <MentorCard key={m.alumnusId} mentor={m} index={i} onPick={open} />)
              )}
            </motion.div>
          ) : (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32" />)
              ) : bookings.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-16 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-display text-xl text-ink">No bookings yet</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto">
                      Browse mentors and reserve your first session — it takes about 30 seconds.
                    </p>
                    <Button variant="accent" size="sm" className="mt-5" onClick={() => setTab("mentors")}>
                      Browse mentors <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((b, i) => <BookingCard key={b.id} booking={b} index={i} />)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Booking modal */}
      <AnimatePresence>
        {selected && (
          <BookingDialog
            mentor={selected}
            picked={picked}
            setPicked={setPicked}
            goal={goal}
            setGoal={setGoal}
            onClose={close}
            onSubmit={submit}
            booking={booking}
            success={success}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MentorCard({
  mentor,
  index,
  onPick,
}: {
  mentor: Mentor;
  index: number;
  onPick: (m: Mentor) => void;
}) {
  const a = mentor.alumnus;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.04 }}
      className="rounded-2xl bg-surface border border-line/70 p-5 hover-lift flex flex-col"
    >
      <div className="flex items-start gap-3">
        <Link href={`/alumni/${a.id}`}>
          <Avatar src={a.avatar} name={a.name} size={48} online={a.online} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/alumni/${a.id}`} className="text-[15px] font-medium text-ink hover:underline truncate block">
            {a.name}
          </Link>
          <p className="text-[12px] text-muted-foreground truncate">
            {a.role} · {a.company}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="text-ink font-medium">{mentor.rating.toFixed(1)}</span>
            </span>
            <span>·</span>
            <span>{mentor.sessionsCompleted} sessions</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {mentor.hourlyPrice === null ? (
            <Badge variant="accent">Free</Badge>
          ) : (
            <span className="text-[14px] font-medium text-ink">${mentor.hourlyPrice}<span className="text-[11px] text-muted-foreground font-normal">/hr</span></span>
          )}
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-ink/75 line-clamp-3 flex-1">{a.bio}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {a.expertise.slice(0, 3).map((e) => (
          <Badge key={e} variant="outline">{e}</Badge>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-line/60 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {mentor.availability.length} slots open
        </span>
        <Button variant="primary" size="sm" onClick={() => onPick(mentor)}>
          Book session
        </Button>
      </div>
    </motion.div>
  );
}

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const d = new Date(booking.slot);
  const isUpcoming = booking.status === "upcoming";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.04 }}
      className="rounded-2xl bg-surface border border-line/70 p-5"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex flex-col items-center justify-center h-14 w-14 rounded-xl shrink-0 ${
            isUpcoming ? "bg-accent text-accent-foreground" : "bg-muted text-ink/60"
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider opacity-80">
            {d.toLocaleString("en", { month: "short" })}
          </span>
          <span className="text-[18px] font-semibold leading-none">{d.getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/alumni/${booking.mentor.id}`} className="text-[15px] font-medium text-ink hover:underline">
              {booking.mentor.name}
            </Link>
            <Badge variant={isUpcoming ? "accent" : "default"} className="capitalize">
              {booking.status}
            </Badge>
          </div>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {d.toLocaleString("en", {
              weekday: "long",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          {booking.goal && (
            <p className="mt-2 text-[13px] text-ink/80 leading-relaxed">"{booking.goal}"</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BookingDialog({
  mentor, picked, setPicked, goal, setGoal, onClose, onSubmit, booking, success,
}: {
  mentor: Mentor;
  picked: string | null;
  setPicked: (s: string) => void;
  goal: string;
  setGoal: (s: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  booking: boolean;
  success: boolean;
}) {
  const a = mentor.alumnus;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-surface border border-line/70 shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 rounded-lg hover:bg-muted/60 inline-flex items-center justify-center text-muted-foreground hover:text-ink z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="px-6 py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
                className="mx-auto h-14 w-14 rounded-full bg-accent flex items-center justify-center"
              >
                <Check className="h-6 w-6 text-accent-foreground" strokeWidth={2.5} />
              </motion.div>
              <h2 className="mt-4 text-display text-2xl text-ink">You're booked</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                We've notified {a.name.split(" ")[0]} and added it to your calendar.
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" exit={{ opacity: 0 }}>
              <div
                className="h-20 relative"
                style={{
                  background: a.coverColor.startsWith("linear")
                    ? a.coverColor
                    : `linear-gradient(135deg, ${a.coverColor})`,
                }}
              />
              <div className="px-6 pb-6 -mt-9">
                <Avatar src={a.avatar} name={a.name} size={56} className="ring-4 ring-surface" />
                <div className="mt-3">
                  <h2 className="text-display text-2xl text-ink">Book {a.name}</h2>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    {a.role} · {a.company}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
                    Pick a time
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {mentor.availability.map((slot) => {
                      const d = new Date(slot);
                      const selected = picked === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setPicked(slot)}
                          className={`relative rounded-xl border px-3 py-2.5 text-left transition-all ${
                            selected
                              ? "border-accent/50 bg-accent-soft text-ink"
                              : "border-line/70 hover:border-line"
                          }`}
                        >
                          <p className="text-[12px] font-medium text-ink">
                            {d.toLocaleString("en", { weekday: "short", month: "short", day: "numeric" })}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {d.toLocaleString("en", { hour: "numeric", minute: "2-digit" })}
                          </p>
                          {selected && (
                            <motion.span
                              layoutId="slot-tick"
                              className="absolute top-2 right-2 h-4 w-4 rounded-full bg-accent flex items-center justify-center"
                            >
                              <Check className="h-2.5 w-2.5 text-accent-foreground" strokeWidth={3} />
                            </motion.span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2 block">
                    What would you like to cover?
                  </label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Resume review for product internships, or break into VC."
                    rows={3}
                    className="w-full resize-none rounded-xl bg-surface border border-line/80 px-3 py-2.5 text-[13px] text-ink placeholder:text-muted-foreground/70 outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {mentor.hourlyPrice === null ? "Free session" : `$${mentor.hourlyPrice} per hour`}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                    <Button variant="accent" size="sm" onClick={onSubmit} disabled={!picked || booking}>
                      {booking ? "Booking…" : "Confirm booking"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
