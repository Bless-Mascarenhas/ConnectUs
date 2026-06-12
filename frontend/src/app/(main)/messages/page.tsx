"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, Phone, Video, MoreHorizontal, ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { EASE, relativeTime } from "@/lib/utils";
import type { ConversationFull, Me } from "@/types";

interface Msg {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  read: boolean;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const convoIdParam = searchParams.get("convo");

  const [myId, setMyId] = React.useState<string | null>(null);
  const [convos, setConvos] = React.useState<ConversationFull[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [msgLoading, setMsgLoading] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const isMine = React.useCallback(
    (senderId: string) => (myId ? senderId === myId || senderId === "me" : senderId === "me"),
    [myId]
  );

  React.useEffect(() => {
    Promise.all([api<Me>("/api/users/me"), api<ConversationFull[]>("/api/messages/conversations")])
      .then(([me, cs]) => {
        setMyId(me.id);
        setConvos(cs);
        if (convoIdParam) {
          setActiveId(convoIdParam);
        } else if (cs[0]) {
          setActiveId(cs[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []); // Only run on mount, convoIdParam is handled below

  React.useEffect(() => {
    if (convoIdParam && convos.some((c) => c.id === convoIdParam)) {
      setActiveId(convoIdParam);
    }
  }, [convoIdParam, convos]);

  React.useEffect(() => {
    if (!activeId) return;
    setMsgLoading(true);
    api<Msg[]>(`/api/messages/${activeId}`)
      .then(setMsgs)
      .finally(() => setMsgLoading(false));
      
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message", filter: `conversationId=eq.${activeId}` },
        (payload) => {
          const newMsg = payload.new as Msg;
          setMsgs((m) => {
            // Prevent duplicate optimistic messages
            if (m.some((x) => x.id === newMsg.id)) return m;
            return [...m, newMsg];
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, activeId]);

  const active = convos.find((c) => c.id === activeId);
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return convos;
    return convos.filter((c) => c.participant.name.toLowerCase().includes(q));
  }, [convos, search]);

  const send = async () => {
    const body = draft.trim();
    if (!body || !activeId) return;
    setSending(true);
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      conversationId: activeId,
      senderId: myId ?? "me",
      body,
      createdAt: new Date().toISOString(),
      read: true,
    };
    setMsgs((m) => [...m, optimistic]);
    setDraft("");
    try {
      const real = await api<Msg>("/api/messages", {
        method: "POST",
        body: JSON.stringify({ conversationId: activeId, body }),
      });
      setMsgs((m) => {
        // If the realtime event already fired, we might have the real message
        if (m.some(x => x.id === real.id)) {
           return m.filter(x => x.id !== optimistic.id);
        }
        return m.map((x) => (x.id === optimistic.id ? real : x));
      });
    } catch {
      setMsgs((m) => m.filter((x) => x.id !== optimistic.id));
      setDraft(body);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-screen flex">
      <aside
        className={`${active ? "hidden md:flex" : "flex"} w-full md:w-[340px] lg:w-[380px] shrink-0 border-r border-line/60 flex-col bg-surface/40`}
      >
        <div className="px-5 pt-8 pb-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-accent" /> Inbox
          </p>
          <h1 className="text-display text-3xl text-ink mt-1.5">Messages</h1>
        </div>
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
              className="pl-8 h-9 text-[13px]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="space-y-1 px-2 mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-[13px] text-muted-foreground">
              No conversations match "{search}".
            </div>
          ) : (
            filtered.map((c, i) => {
              const isActive = c.id === activeId;
              return (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: EASE, delay: i * 0.025 }}
                  onClick={() => {
                    setActiveId(c.id);
                    if (c.unread > 0) {
                      setConvos((curr) =>
                        curr.map((convo) =>
                          convo.id === c.id ? { ...convo, unread: 0 } : convo
                        )
                      );
                    }
                  }}
                  className={`relative w-full text-left rounded-xl px-3 py-2.5 flex gap-3 items-center transition-colors ${
                    isActive ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="convo-active"
                      transition={{ duration: 0.22, ease: EASE }}
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-accent"
                    />
                  )}
                  <Avatar
                    src={c.participant.avatar}
                    name={c.participant.name}
                    size={40}
                    online={c.participant.online}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-medium text-ink truncate">
                        {c.participant.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {relativeTime(c.lastMessageAt)}
                      </span>
                    </div>
                    <p
                      className={`text-[12px] truncate mt-0.5 ${
                        c.unread > 0 ? "text-ink/90 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {c.last && isMine(c.last.senderId) ? "You: " : ""}
                      {c.last?.body ?? "Start the conversation"}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </aside>

      <main className={`${active ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0 bg-canvas`}>
        {!active ? (
          <EmptyThread />
        ) : (
          <>
            <header className="h-16 border-b border-line/60 flex items-center gap-3 px-5">
              <button
                className="md:hidden text-muted-foreground hover:text-ink"
                onClick={() => setActiveId(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Avatar
                src={active.participant.avatar}
                name={active.participant.name}
                size={36}
                online={active.participant.online}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-ink truncate">
                  {active.participant.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {active.participant.role} · {active.participant.company}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="Call">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Video">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="More">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
              {msgLoading ? (
                <div className="max-w-2xl mx-auto space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? "w-[60%]" : "w-[45%] ml-auto"}`} />
                  ))}
                </div>
              ) : (
                <div className="max-w-2xl mx-auto flex flex-col gap-1.5">
                  <div className="text-center text-[11px] uppercase tracking-[0.14em] text-muted-foreground py-4">
                    <Sparkles className="inline h-3 w-3 mr-1 -mt-0.5" />
                    Start of conversation
                  </div>
                  <AnimatePresence initial={false}>
                    {msgs.map((m, i) => {
                      const mine = isMine(m.senderId);
                      const prev = msgs[i - 1];
                      const showAvatar = !mine && (!prev || prev.senderId !== m.senderId);
                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}
                        >
                          {!mine && (
                            <div className="w-7 shrink-0">
                              {showAvatar && (
                                <Avatar
                                  src={active.participant.avatar}
                                  name={active.participant.name}
                                  size={28}
                                />
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed ${
                              mine
                                ? "bg-accent text-accent-foreground rounded-br-md"
                                : "bg-muted text-ink rounded-bl-md"
                            }`}
                          >
                            {m.body}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <footer className="border-t border-line/60 bg-surface/60 px-4 md:px-8 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="max-w-2xl mx-auto flex items-end gap-2"
              >
                <div className="flex-1 relative">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder={`Message ${active.participant.name.split(" ")[0]}…`}
                    rows={1}
                    className="w-full resize-none rounded-xl bg-surface border border-line/80 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted-foreground/70 outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-colors max-h-32"
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  size="icon"
                  disabled={!draft.trim() || sending}
                  aria-label="Send"
                  className="h-10 w-10 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="max-w-2xl mx-auto mt-1.5 text-[10px] text-muted-foreground">
                <span className="kbd">↵</span> to send · <span className="kbd">⇧↵</span> for newline
              </p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyThread() {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="text-center max-w-sm"
      >
        <div className="mx-auto mb-5 h-12 w-12 rounded-2xl bg-accent-soft border border-accent/15 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-accent" strokeWidth={1.75} />
        </div>
        <h2 className="text-display text-2xl text-ink">Pick a conversation</h2>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Select someone from the inbox to read the thread, or start a new one from an alumnus's profile.
        </p>
      </motion.div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div className="flex-1 h-screen bg-canvas" />}>
      <MessagesContent />
    </React.Suspense>
  );
}
