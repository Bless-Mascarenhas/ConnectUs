import { z } from "zod";

// Reusable sanitized string (trims whitespace, enforces max length)
const safeString = (max: number) => z.string().trim().min(1).max(max);

// ─── PATCH /api/users/me ────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name:        safeString(100).optional(),
  university:  safeString(200).optional(),
  major:       safeString(100).optional(),
  bio:         z.string().trim().max(2000).optional(),
  avatar:      z.string().url().max(500).optional(),
  coverUrl:    z.string().url().max(500).optional(),
  preferences: z.object({
    msgs:      z.boolean(),
    mentions:  z.boolean(),
    events:    z.boolean(),
    weekly:    z.boolean(),
    marketing: z.boolean(),
  }).optional(),
  experience: z.array(z.object({
    role: safeString(200),
    org:  safeString(200),
    from: safeString(20),
    to:   safeString(20),
  })).max(20).optional(),
  interests: z.array(z.string().trim().max(100)).max(30).optional(),
}).strict();

// ─── POST /api/messages ─────────────────────────────────────────────
export const sendMessageSchema = z.object({
  conversationId: safeString(50),
  body:           safeString(5000),
});

// ─── POST /api/mentorship/book ──────────────────────────────────────
export const bookMentorSchema = z.object({
  mentorId: safeString(50),
  slot:     z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Invalid date" }),
  goal:     z.string().trim().max(1000).optional(),
});

// ─── POST /api/events ───────────────────────────────────────────────
export const createEventSchema = z.object({
  title:       safeString(200),
  description: safeString(5000),
  date:        z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Invalid date" }),
  virtual:     z.boolean().optional(),
  location:    z.string().trim().max(300).optional(),
  cover:       z.string().max(500).optional(),
});

// ─── POST /api/feed/posts ───────────────────────────────────────────
export const createPostSchema = z.object({
  content: safeString(5000),
  image:   z.string().url().max(500).optional().nullable(),
});

// ─── POST /api/feed/posts/:id/comments ──────────────────────────────
export const createCommentSchema = z.object({
  body: safeString(2000),
});

// ─── POST /api/feed/posts/:id/react ─────────────────────────────────
export const reactSchema = z.object({
  emoji: z.string().min(1).max(10),
});
