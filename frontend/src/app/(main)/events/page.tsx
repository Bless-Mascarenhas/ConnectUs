"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, Video, Users, Check, X, Clock, Sparkles,
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
import { EASE } from "@/lib/utils";
import type { EventItem, Me } from "@/types";

type Tab = "upcoming" | "past" | "going";

export default function EventsPage() {
  const [me, setMe] = React.useState<Me | null>(null);
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<Tab>("upcoming");
  const [active, setActive] = React.useState<EventItem | null>(null);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      api<Me>("/api/users/me").catch(() => null),
      api<EventItem[]>("/api/events")
    ]).then(([m, evs]) => {
      setMe(m);
      setEvents(evs);
    }).finally(() => setLoading(false));
  }, []);

  const now = Date.now();
  const filtered = React.useMemo(() => {
    if (tab === "upcoming") return events.filter((e) => new Date(e.date).getTime() > now);
    if (tab === "past") return events.filter((e) => new Date(e.date).getTime() <= now);
    return events.filter((e) => e.going);
  }, [events, tab, now]);

  const toggleRsvp = async (e: EventItem) => {
    const next = !e.going;
    setEvents((evts) => evts.map((x) => (x.id === e.id ? { ...x, going: next } : x)));
    if (active?.id === e.id) setActive({ ...active, going: next });
    try {
      await api(`/api/events/${e.id}/rsvp`, { method: "POST" });
    } catch {
      setEvents((evts) => evts.map((x) => (x.id === e.id ? { ...x, going: !next } : x)));
    }
  };

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-14 max-w-[1280px] mx-auto">
      <PageHeader
        eyebrow="Calendar"
        title={<>Upcoming <span className="italic text-ink/40">events</span></>}
        description="Mixers, panels, workshops, and office hours — hosted by alumni, open to students."
        right={
          <div className="inline-flex items-center gap-1 rounded-lg border border-line/80 bg-surface p-0.5">
            {(["upcoming", "going", "past"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative h-9 px-3 text-[12px] font-medium rounded-md capitalize transition-colors ${tab === t ? "text-ink" : "text-muted-foreground hover:text-ink"
                  }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="event-tab"
                    transition={{ duration: 0.22, ease: EASE }}
                    className="absolute inset-0 rounded-md bg-muted"
                  />
                )}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
        }
      />

      {me?.role === "alumnus" && (
        <div className="mt-6 flex justify-end">
          <Button variant="accent" onClick={() => setCreating(true)}>
            + Create event
          </Button>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[300px]" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-display text-xl text-ink">Nothing here</h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-xs mx-auto">
                {tab === "going"
                  ? "You haven't RSVP'd to any events yet."
                  : tab === "past"
                    ? "No past events to show."
                    : "No upcoming events on the calendar."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} onOpen={setActive} onRsvp={toggleRsvp} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <EventDialog event={active} onClose={() => setActive(null)} onRsvp={toggleRsvp} />
        )}
        {creating && (
          <CreateEventDialog
            onClose={() => setCreating(false)}
            onSuccess={(e) => { setEvents((prev) => [...prev, e].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())); setCreating(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({
  event, index, onOpen, onRsvp,
}: {
  event: EventItem;
  index: number;
  onOpen: (e: EventItem) => void;
  onRsvp: (e: EventItem) => void;
}) {
  const d = new Date(event.date);
  const isPast = d.getTime() < Date.now();
  return (
    <motion.div
      layoutId={`event-card-${event.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.04 }}
      onClick={() => onOpen(event)}
      className="group rounded-2xl bg-surface border border-line/70 overflow-hidden hover-lift cursor-pointer flex flex-col"
    >
      <div
        className="h-32 relative"
        style={{ background: `linear-gradient(135deg, ${event.cover})` }}
      >
        <div className="absolute top-3 left-3 bg-canvas/95 backdrop-blur rounded-lg px-2.5 py-1.5 flex flex-col items-center min-w-[44px]">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
            {d.toLocaleString("en", { month: "short" })}
          </span>
          <span className="text-[16px] font-semibold leading-none text-ink">{d.getDate()}</span>
        </div>
        {event.going && (
          <div className="absolute top-3 right-3">
            <Badge variant="accent" className="bg-accent text-accent-foreground border-accent">
              <Check className="h-3 w-3" strokeWidth={3} /> Going
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-[15px] font-medium text-ink leading-snug line-clamp-2">{event.title}</h3>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {d.toLocaleString("en", { weekday: "short", hour: "numeric", minute: "2-digit" })}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 truncate">
            {event.virtual ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
            <span className="truncate">{event.virtual ? "Virtual" : event.location}</span>
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-line/60">
          <div className="flex items-center -space-x-2">
            {event.attendeeProfiles?.slice(0, 4).map((a) => (
              <div key={a.id} className="ring-2 ring-surface rounded-full">
                <Avatar src={a.avatar} name={a.name} size={22} />
              </div>
            ))}
            <span className="ml-3 text-[11px] text-muted-foreground">
              {event.attendees.length} going
            </span>
          </div>
          {!isPast && (
            <Button
              variant={event.going ? "subtle" : "outline"}
              size="sm"
              onClick={(ev) => {
                ev.stopPropagation();
                onRsvp(event);
              }}
              className="h-7 px-2.5 text-[11px]"
            >
              {event.going ? "Going" : "RSVP"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EventDialog({
  event, onClose, onRsvp,
}: {
  event: EventItem;
  onClose: () => void;
  onRsvp: (e: EventItem) => void;
}) {
  const d = new Date(event.date);
  const isPast = d.getTime() < Date.now();
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
        layoutId={`event-card-${event.id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-surface border border-line/70 shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-canvas/90 backdrop-blur hover:bg-canvas inline-flex items-center justify-center text-muted-foreground hover:text-ink z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="h-40 relative" style={{ background: `linear-gradient(135deg, ${event.cover})` }} />
        <div className="p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" />
            {event.virtual ? "Virtual" : "In person"}
          </div>
          <h2 className="text-display text-2xl text-ink mt-2 leading-tight">{event.title}</h2>

          <div className="mt-4 space-y-2 text-[13px]">
            <div className="flex items-center gap-2 text-ink/80">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {d.toLocaleString("en", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
            <div className="flex items-center gap-2 text-ink/80">
              {event.virtual ? (
                <Video className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {event.location}
            </div>
            {event.host && (
              <div className="flex items-center gap-2 text-ink/80">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Hosted by <span className="text-ink font-medium">{event.host.name}</span>
              </div>
            )}
          </div>

          <p className="mt-4 text-[14px] leading-relaxed text-ink/80">{event.description}</p>

          <div className="mt-5 pt-5 border-t border-line/60">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2.5">
              {event.attendees.length} going
            </p>
            <div className="flex items-center -space-x-2">
              {event.attendeeProfiles?.slice(0, 8).map((a) => (
                <div key={a.id} className="ring-2 ring-surface rounded-full">
                  <Avatar src={a.avatar} name={a.name} size={28} />
                </div>
              ))}
              {event.attendees.length > 8 && (
                <div className="ml-3 h-7 px-2 rounded-full bg-muted text-[11px] font-medium text-muted-foreground flex items-center">
                  +{event.attendees.length - 8}
                </div>
              )}
            </div>
          </div>

          {!isPast && (
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="ghost" size="md" onClick={onClose}>Maybe later</Button>
              <Button
                variant={event.going ? "subtle" : "accent"}
                size="md"
                onClick={() => onRsvp(event)}
              >
                {event.going ? (
                  <><Check className="h-4 w-4" /> You&apos;re going</>
                ) : (
                  "RSVP"
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateEventDialog({ onClose, onSuccess }: { onClose: () => void, onSuccess: (e: EventItem) => void }) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [virtual, setVirtual] = React.useState(true);
  const [location, setLocation] = React.useState("");
  const [cover, setCover] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async () => {
    if (!title || !description || !date) return;
    setSubmitting(true);
    try {
      const e = await api<EventItem>("/api/events", {
        method: "POST",
        body: JSON.stringify({ title, description, date, virtual, location: virtual ? "Virtual" : location, cover: cover || undefined }),
      });
      onSuccess(e);
    } finally {
      setSubmitting(false);
    }
  };

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
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-surface border border-line/70 shadow-2xl p-6"
      >
        <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-lg hover:bg-muted/60 inline-flex items-center justify-center text-muted-foreground hover:text-ink">
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-display text-2xl text-ink">Create event</h2>
        <div className="mt-5 space-y-4">
          <ImageUpload
            bucket="event-covers"
            pathPrefix={`event-${Date.now()}`}
            variant="cover"
            onUpload={setCover}
          />
          <div>
            <label className="text-[12px] font-medium text-ink mb-1.5 block">Event title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. UX Design Workshop" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-ink mb-1.5 block">Date & Time</label>
            <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[12px] font-medium text-ink">Format:</label>
            <label className="text-[12px] flex items-center gap-1.5"><input type="radio" checked={virtual} onChange={() => setVirtual(true)} /> Virtual</label>
            <label className="text-[12px] flex items-center gap-1.5"><input type="radio" checked={!virtual} onChange={() => setVirtual(false)} /> In-person</label>
          </div>
          {!virtual && (
            <div>
              <label className="text-[12px] font-medium text-ink mb-1.5 block">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Blue Bottle Coffee, Palo Alto" />
            </div>
          )}
          <div>
            <label className="text-[12px] font-medium text-ink mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you cover?"
              rows={3}
              className="w-full resize-none rounded-xl bg-surface border border-line/80 px-3 py-2.5 text-[13px] text-ink placeholder:text-muted-foreground/70 outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={submit} disabled={submitting || !title || !description || !date}>
            {submitting ? "Creating..." : "Create event"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
