import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./lib/prisma";
import { authenticate } from "./lib/auth";
import { mapAlumnus, mapMe, mapPost } from "./lib/mappers";
import { generalLimiter, writeLimiter } from "./lib/rateLimiter";
import {
  updateProfileSchema, sendMessageSchema, bookMentorSchema,
  createEventSchema, createPostSchema, createCommentSchema, reactSchema,
} from "./lib/validators";

const app = express();

// ── Helmet: Obfuscate tech stack & add security headers ─────────────
app.use(helmet());

// ── CORS: only allow our frontend origin ────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL ?? "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body size limit: reject payloads > 1MB ──────────────────────────
app.use(express.json({ limit: "1mb" }));

// ── Rate limiting: 100 req/min global ───────────────────────────────
app.use(generalLimiter);

function uid(req: Request): string {
  return req.userId!;
}

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: true });
  } catch {
    res.status(503).json({ ok: false, db: false });
  }
});

app.use(async (req, res, next) => {
  if (req.path === "/api/health") return next();
  return authenticate(req, res, next);
});

app.get("/api/users/me", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: uid(req) } });
  if (!user) return res.status(404).json({ error: "not found" });
  
  // Calculate dynamic unread message count
  const convos = await prisma.conversation.findMany({
    select: { unread: true }
  });
  const unreadCount = convos.reduce((acc, c) => acc + c.unread, 0);
  
  const stats = user.stats as { connections: number; pending: number; events: number; unread: number };
  stats.unread = unreadCount;
  user.stats = stats as any;

  res.json(mapMe(user));
});

app.patch("/api/users/me", writeLimiter, async (req, res) => {
  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.flatten().fieldErrors });
  }

  const data = result.data;
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "no fields to update" });
  }

  const user = await prisma.user.update({
    where: { id: uid(req) },
    data,
  });
  res.json(mapMe(user));
});

app.delete("/api/users/me", async (req, res) => {
  const userId = uid(req);
  // Delete user row from database
  await prisma.connection.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  // Delete from Supabase Auth using the admin client from auth module
  const { supabaseAdmin } = await import("./lib/auth");
  await supabaseAdmin.auth.admin.deleteUser(userId);
  res.json({ deleted: true });
});

app.get("/api/connections", async (req, res) => {
  const rows = await prisma.connection.findMany({
    where: { userId: uid(req) },
    orderBy: { createdAt: "desc" },
  });
  res.json(rows.map(c => ({ id: c.id, alumniId: c.alumniId, createdAt: c.createdAt.toISOString() })));
});

app.post("/api/connections/:alumniId", async (req, res) => {
  const userId = uid(req);
  const { alumniId } = req.params;
  const existing = await prisma.connection.findUnique({
    where: { userId_alumniId: { userId, alumniId } },
  });
  if (existing) return res.json({ id: existing.id, alumniId, connected: true });

  const conn = await prisma.connection.create({
    data: { userId, alumniId },
  });
  // Update stats.connections count
  const count = await prisma.connection.count({ where: { userId } });
  await prisma.user.update({
    where: { id: userId },
    data: { stats: { connections: count, pending: 0, events: 0, unread: 0 } },
  });
  res.json({ id: conn.id, alumniId, connected: true });
});

app.delete("/api/connections/:alumniId", async (req, res) => {
  const userId = uid(req);
  const { alumniId } = req.params;
  await prisma.connection.deleteMany({ where: { userId, alumniId } });
  const count = await prisma.connection.count({ where: { userId } });
  await prisma.user.update({
    where: { id: userId },
    data: { stats: { connections: count, pending: 0, events: 0, unread: 0 } },
  });
  res.json({ alumniId, connected: false });
});

app.get("/api/alumni", async (req: Request, res: Response) => {
  const { search, year, industry, expertise } = req.query as Record<string, string | undefined>;
  const rows = await prisma.alumnus.findMany({ orderBy: { name: "asc" } });
  let result = rows.map(mapAlumnus);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((a) =>
      [a.name, a.role, a.company, a.bio, a.location, a.university, a.major]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  if (year) result = result.filter((a) => String(a.gradYear) === year);
  if (industry) result = result.filter((a) => a.industry === industry);
  if (expertise) result = result.filter((a) => a.expertise.includes(expertise));
  res.json(result);
});

app.get("/api/alumni/:id", async (req, res) => {
  const row = await prisma.alumnus.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ error: "not found" });
  res.json(mapAlumnus(row));
});

app.get("/api/students", async (_req, res) => {
  const rows = await prisma.student.findMany({ orderBy: { name: "asc" } });
  res.json(
    rows.map((s) => ({
      ...s,
      interests: s.interests as string[],
    }))
  );
});

app.get("/api/messages/conversations", async (_req, res) => {
  const convos = await prisma.conversation.findMany({
    include: { participant: true, messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { lastMessageAt: "desc" },
  });
  const enriched = convos.map((c) => {
    const last = c.messages[c.messages.length - 1];
    return {
      id: c.id,
      participantId: c.participantId,
      lastMessageAt: c.lastMessageAt.toISOString(),
      unread: c.unread,
      last: last
        ? {
            id: last.id,
            conversationId: last.conversationId,
            senderId: last.senderId,
            body: last.body,
            createdAt: last.createdAt.toISOString(),
            read: last.read,
          }
        : undefined,
      participant: mapAlumnus(c.participant),
    };
  });
  res.json(enriched);
});

app.get("/api/messages/:conversationId", async (req, res) => {
  // Authorization: verify user owns this conversation
  const convo = await prisma.conversation.findUnique({
    where: { id: req.params.conversationId },
  });
  if (!convo) return res.status(404).json({ error: "not found" });
  if (convo.userId && convo.userId !== uid(req)) {
    return res.status(403).json({ error: "forbidden" });
  }

  const rows = await prisma.message.findMany({
    where: { conversationId: req.params.conversationId },
    orderBy: { createdAt: "asc" },
  });

  // Mark conversation as read
  await prisma.conversation.update({
    where: { id: req.params.conversationId },
    data: { unread: 0 },
  });

  // Mark all messages as read
  await prisma.message.updateMany({
    where: { conversationId: req.params.conversationId, read: false },
    data: { read: true },
  });
  res.json(
    rows.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      read: m.read,
    }))
  );
});

app.post("/api/messages", writeLimiter, async (req, res) => {
  const result = sendMessageSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.flatten().fieldErrors });
  }
  const { conversationId, body } = result.data;

  // Authorization: verify user owns this conversation
  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return res.status(404).json({ error: "conversation not found" });
  if (convo.userId && convo.userId !== uid(req)) {
    return res.status(403).json({ error: "forbidden" });
  }

  const now = new Date();
  const userId = uid(req);
  const msg = await prisma.message.create({
    data: {
      id: `m${Date.now()}`,
      conversationId,
      senderId: userId,
      body,
      createdAt: now,
      read: true,
    },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: now },
  });
  res.json({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    body: msg.body,
    createdAt: msg.createdAt.toISOString(),
    read: msg.read,
  });
});

app.get("/api/mentorship/mentors", async (_req, res) => {
  const rows = await prisma.mentorProfile.findMany({ include: { alumnus: true } });
  res.json(
    rows.map((m) => ({
      alumnusId: m.alumnusId,
      hourlyPrice: m.hourlyPrice,
      rating: m.rating,
      sessionsCompleted: m.sessionsCompleted,
      availability: m.availability as string[],
      alumnus: mapAlumnus(m.alumnus),
    }))
  );
});

app.get("/api/mentorship/bookings", async (req, res) => {
  // Authorization: only return bookings belonging to this user
  const userId = uid(req);
  const rows = await prisma.booking.findMany({
    where: { userId },
    include: { mentor: { include: { alumnus: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(
    rows.map((b) => ({
      id: b.id,
      mentorId: b.mentorId,
      slot: b.slot.toISOString(),
      goal: b.goal,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
      mentor: mapAlumnus(b.mentor.alumnus),
    }))
  );
});

app.post("/api/mentorship/book", writeLimiter, async (req, res) => {
  const result = bookMentorSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.flatten().fieldErrors });
  }
  const { mentorId, slot, goal } = result.data;
  const userId = uid(req);
  const booking = await prisma.booking.create({
    data: {
      id: `b${Date.now()}`,
      userId,
      mentorId,
      slot: new Date(slot),
      goal: goal ?? "",
      status: "upcoming",
      createdAt: new Date(),
    },
  });
  res.json({
    id: booking.id,
    mentorId: booking.mentorId,
    slot: booking.slot.toISOString(),
    goal: booking.goal,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  });
});

app.get("/api/events", async (req, res) => {
  const userId = uid(req);
  const rows = await prisma.event.findMany({
    include: { host: true },
    orderBy: { date: "asc" },
  });
  const allAlumni = await prisma.alumnus.findMany();
  const byId = new Map(allAlumni.map((a) => [a.id, mapAlumnus(a)]));
  res.json(
    rows.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date.toISOString(),
      endDate: e.endDate.toISOString(),
      location: e.location,
      virtual: e.virtual,
      hostId: e.hostId,
      cover: e.cover,
      attendees: e.attendees,
      going: e.attendees.includes(userId),
      host: mapAlumnus(e.host),
      attendeeProfiles: e.attendees.map((id) => byId.get(id)).filter(Boolean),
    }))
  );
});

app.post("/api/events/:id/rsvp", writeLimiter, async (req, res) => {
  const userId = uid(req);
  const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "not found" });
  
  const isGoing = existing.attendees.includes(userId);
  const newAttendees = isGoing 
    ? existing.attendees.filter(id => id !== userId) 
    : [...existing.attendees, userId];

  const updated = await prisma.event.update({
    where: { id: req.params.id },
    data: { attendees: newAttendees, going: !isGoing },
  });
  res.json({ id: updated.id, going: newAttendees.includes(userId) });
});

app.post("/api/events", writeLimiter, async (req, res) => {
  const result = createEventSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.flatten().fieldErrors });
  }
  const { title, description, date, virtual, location, cover } = result.data;
  const userId = uid(req);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user || user.role !== "alumnus") {
    // Only alumni can create events
    return res.status(403).json({ error: "only alumni can create events" });
  }

  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour later

  const event = await prisma.event.create({
    data: {
      id: `e${Date.now()}`,
      title,
      description,
      date: startDate,
      endDate: endDate,
      location: virtual ? "Virtual" : (location || ""),
      virtual: virtual ?? false,
      hostId: userId,
      cover: cover || "#5B7C5A, #A8C09A",
      attendees: [userId],
      going: true,
    },
    include: { host: true },
  });

  const allAlumni = await prisma.alumnus.findMany();
  const byId = new Map(allAlumni.map((a) => [a.id, mapAlumnus(a)]));

  res.json({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date.toISOString(),
    endDate: event.endDate.toISOString(),
    location: event.location,
    virtual: event.virtual,
    hostId: event.hostId,
    cover: event.cover,
    attendees: event.attendees,
    going: event.going,
    host: mapAlumnus(event.host),
    attendeeProfiles: event.attendees.map((id) => byId.get(id)).filter(Boolean),
  });
});

app.get("/api/feed", async (req, res) => {
  const userId = uid(req);
  const [rows, meUser, alumniRows] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.alumnus.findMany(),
  ]);
  const meProfile = meUser ? mapMe(meUser) : null;
  const byId = new Map(alumniRows.map((a) => [a.id, mapAlumnus(a)]));
  const enriched = rows.map((r) => {
    let author = byId.get(r.authorId) || null;
    if ((r.authorId === userId || r.authorId === "me") && meUser) {
      author = meProfile;
    }
    return {
      ...mapPost(r),
      author,
    };
  });
  res.json(enriched);
});

app.post("/api/feed/posts", writeLimiter, async (req, res) => {
  const result = createPostSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.flatten().fieldErrors });
  }
  const { content, image } = result.data;
  const userId = uid(req);
  const now = new Date();
  const row = await prisma.post.create({
    data: {
      id: `p${Date.now()}`,
      authorId: userId,
      content,
      image: image ?? null,
      createdAt: now,
      reactions: [
        { emoji: "👏", count: 0 },
        { emoji: "💡", count: 0 },
        { emoji: "🎉", count: 0 },
        { emoji: "❤️", count: 0 },
      ],
      comments: [],
    },
  });
  const meUser = await prisma.user.findUnique({ where: { id: userId } });
  res.json({ ...mapPost(row), author: meUser ? mapMe(meUser) : null });
});

app.post("/api/feed/posts/:id/comments", writeLimiter, async (req, res) => {
  const result = createCommentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.flatten().fieldErrors });
  }
  const { body } = result.data;
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ error: "post not found" });

  const comments = (post.comments || []) as Record<string, unknown>[];
  const newComment = {
    id: `c${Date.now()}`,
    authorId: uid(req),
    body,
    createdAt: new Date().toISOString(),
  };

  await prisma.post.update({
    where: { id: req.params.id },
    data: { comments: [...comments, newComment] },
  });

  res.json(newComment);
});

app.post("/api/feed/posts/:id/react", writeLimiter, async (req, res) => {
  const result = reactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.flatten().fieldErrors });
  }
  const { emoji } = result.data;
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ error: "post not found" });

  let reactions = (post.reactions || []) as { emoji: string; count: number }[];
  let found = false;
  
  reactions = reactions.map(r => {
    if (r.emoji === emoji) {
      found = true;
      return { ...r, count: r.count + 1 };
    }
    return r;
  });

  if (!found) {
    reactions.push({ emoji, count: 1 });
  }

  await prisma.post.update({
    where: { id: req.params.id },
    data: { reactions },
  });

  res.json({ success: true, reactions });
});

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`ConnectUs API listening on http://localhost:${PORT}`);
});
