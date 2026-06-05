"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Sparkles, Image as ImageIcon, Smile } from "lucide-react";
import { PageHeader } from "@/components/features/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { api } from "@/lib/api";
import { EASE, relativeTime } from "@/lib/utils";
import type { Me, PostFull } from "@/types";

const REACTIONS = ["👏", "💡", "🎉", "❤️"];

export default function FeedPage() {
  const [me, setMe] = React.useState<Me | null>(null);
  const [posts, setPosts] = React.useState<PostFull[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState("");
  const [postImage, setPostImage] = React.useState("");
  const [imageUploading, setImageUploading] = React.useState(false);
  const [posting, setPosting] = React.useState(false);
  const [myReactions, setMyReactions] = React.useState<Record<string, string | undefined>>({});

  React.useEffect(() => {
    Promise.all([api<Me>("/api/users/me"), api<PostFull[]>("/api/feed")])
      .then(([m, p]) => {
        setMe(m);
        setPosts(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    const content = draft.trim();
    if (!content) return;
    setPosting(true);
    try {
      const post = await api<PostFull>("/api/feed/posts", {
        method: "POST",
        body: JSON.stringify({ content, image: postImage || undefined }),
      });
      setPosts((p) => [post, ...p]);
      setDraft("");
      setPostImage("");
    } finally {
      setPosting(false);
    }
  };

  const react = async (postId: string, emoji: string) => {
    const current = myReactions[postId];
    setPosts((p) =>
      p.map((post) => {
        if (post.id !== postId) return post;
        const reactions = post.reactions.map((r) => {
          if (r.emoji === emoji && current !== emoji) return { ...r, count: r.count + 1 };
          if (r.emoji === current && current !== emoji) return { ...r, count: Math.max(0, r.count - 1) };
          if (r.emoji === emoji && current === emoji) return { ...r, count: Math.max(0, r.count - 1) };
          return r;
        });
        if (!reactions.find(r => r.emoji === emoji)) {
           reactions.push({ emoji, count: 1 });
        }
        return { ...post, reactions };
      })
    );
    setMyReactions((m) => ({ ...m, [postId]: current === emoji ? undefined : emoji }));
    try {
      await api(`/api/feed/posts/${postId}/react`, {
        method: "POST",
        body: JSON.stringify({ emoji }),
      });
    } catch {
       // Ideally revert optimistic update on failure
    }
  };

  const comment = async (postId: string, body: string) => {
    try {
      const newComment = await api<{ id: string; authorId: string; body: string; createdAt: string }>(`/api/feed/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setPosts((p) => p.map(post => {
        if (post.id !== postId) return post;
        return { ...post, comments: [...post.comments, newComment] };
      }));
    } catch (e) {
      console.error("Failed to add comment", e);
    }
  };

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-14 max-w-[720px] mx-auto">
      <PageHeader
        eyebrow="Community"
        title={<>The <span className="italic text-ink/40">feed</span></>}
        description="Wisdom, gripes, hot takes, and gentle requests for help from your network."
      />

      {/* Composer */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        className="mt-8 rounded-2xl bg-surface border border-line/70 p-4"
      >
        <div className="flex gap-3">
          {me ? (
            <Avatar src={me.avatar} name={me.name} size={40} />
          ) : (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
          <div className="flex-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Share something with your network…"
              rows={3}
              className="w-full resize-none rounded-xl bg-transparent px-0 py-1 text-[15px] text-ink placeholder:text-muted-foreground/70 outline-none leading-relaxed"
            />
            {postImage && (
              <img src={postImage} alt="Preview" className="mb-3 h-24 w-full rounded-xl object-cover" />
            )}
            <div className="flex items-center justify-between pt-2 border-t border-line/60">
              <div className="flex items-center gap-0.5 -ml-1.5">
                <ImageUpload
                  bucket="post-images"
                  pathPrefix={me?.id ?? "anon"}
                  variant="inline"
                  onUpload={setPostImage}
                  onUploadStart={() => setImageUploading(true)}
                  onUploadEnd={() => setImageUploading(false)}
                />
                <Button variant="ghost" size="icon" aria-label="Emoji">
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground">
                  <span className="kbd">⌘</span> <span className="kbd">↵</span> to post
                </span>
                <Button variant="accent" size="sm" disabled={!draft.trim() || posting || imageUploading} onClick={submit}>
                  <Send className="h-3.5 w-3.5" />
                  {posting ? "Posting…" : imageUploading ? "Uploading image…" : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feed list */}
      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44" />)
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((p, i) => (
              <PostCard
                key={p.id}
                post={p}
                index={i}
                me={me}
                myReaction={myReactions[p.id]}
                onReact={(emoji) => react(p.id, emoji)}
                onComment={(body) => comment(p.id, body)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function PostCard({
  post, index, me, myReaction, onReact, onComment
}: {
  post: PostFull;
  index: number;
  me: Me | null;
  myReaction?: string;
  onReact: (emoji: string) => void;
  onComment: (body: string) => void;
}) {
  const [showComments, setShowComments] = React.useState(false);
  const [commentDraft, setCommentDraft] = React.useState("");
  const isMe = me ? post.authorId === me.id || post.authorId === "me" : post.authorId === "me";
  const total = post.reactions.reduce((s, r) => s + r.count, 0);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: EASE, delay: Math.min(index * 0.03, 0.15) }}
      className="rounded-2xl bg-surface border border-line/70 p-5"
    >
      <header className="flex items-start gap-3">
        {isMe ? (
          <Avatar src={post.author?.avatar} name={post.author?.name || "Unknown"} size={40} />
        ) : (
          <Link href={`/alumni/${post.authorId}`}>
            <Avatar src={post.author?.avatar} name={post.author?.name || "Unknown"} size={40} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isMe ? (
              <span className="text-[14px] font-medium text-ink">{post.author?.name || "Unknown"}</span>
            ) : (
              <Link href={`/alumni/${post.authorId}`} className="text-[14px] font-medium text-ink hover:underline">
                {post.author?.name || "Unknown"}
              </Link>
            )}
            {isMe && <Badge variant="accent">You</Badge>}
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[11px] text-muted-foreground">{relativeTime(post.createdAt)}</span>
          </div>
          {"role" in (post.author || {}) && (
            <p className="text-[12px] text-ink/70">
              {(post.author as any)?.role === "alumnus" ? (post.author as any)?.company : (post.author as any)?.university || "Unknown"}
            </p>
          )}
        </div>
      </header>

      <p className="mt-3 text-[15px] leading-relaxed text-ink/90 whitespace-pre-wrap">{post.content}</p>

      {post.image && (
        <div className="mt-3 rounded-xl overflow-hidden border border-line/60">
          <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-[400px] object-cover" />
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {REACTIONS.map((emoji) => {
            const r = post.reactions.find((x) => x.emoji === emoji);
            const active = myReaction === emoji;
            return (
              <motion.button
                key={emoji}
                onClick={() => onReact(emoji)}
                whileTap={{ scale: 0.9 }}
                className={`group inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] transition-colors ${
                  active
                    ? "bg-accent-soft border border-accent/30 text-ink"
                    : "border border-transparent hover:bg-muted/60"
                }`}
              >
                <span className="text-[14px] leading-none transition-transform group-hover:scale-110">{emoji}</span>
                {r && r.count > 0 && (
                  <span className={`text-[11px] tabular-nums ${active ? "text-ink font-medium" : "text-muted-foreground"}`}>
                    {r.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-ink transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-line/60 space-y-3">
              {post.comments.length === 0 && (
                <p className="text-[12px] text-muted-foreground italic">
                  Be the first to leave a thoughtful comment.
                </p>
              )}
              {post.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
                  <div className="min-w-0 flex-1 rounded-xl bg-muted/50 px-3 py-2">
                    <p className="text-[12px] font-medium text-ink">Alumnus</p>
                    <p className="text-[13px] text-ink/85 leading-relaxed mt-0.5">{c.body}</p>
                  </div>
                </div>
              ))}
              {me && (
                <div className="flex gap-2.5 pt-1">
                  <Avatar src={me.avatar} name={me.name} size={28} />
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentDraft.trim()) {
                        onComment(commentDraft.trim());
                        setCommentDraft("");
                      }
                    }}
                    placeholder="Add a comment…"
                    className="flex-1 h-9 rounded-full bg-muted/50 border border-line/60 px-3.5 text-[13px] text-ink placeholder:text-muted-foreground/70 outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {total > 6 && index === 0 && (
        <div className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-accent font-medium">
          <Sparkles className="h-3 w-3" /> Trending
        </div>
      )}
    </motion.article>
  );
}
