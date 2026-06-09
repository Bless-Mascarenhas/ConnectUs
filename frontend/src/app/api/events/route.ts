import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapAlumnus } from "@/lib/mappers";
import { rateLimit } from "@/lib/rateLimiter";
import { createEventSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await prisma.event.findMany({ include: { host: true }, orderBy: { date: "asc" } });
  const allAlumni = await prisma.alumnus.findMany();
  const byId = new Map(allAlumni.map((a) => [a.id, mapAlumnus(a)]));

  return NextResponse.json(rows.map((e) => ({
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
  })));
}

export async function POST(req: NextRequest) {
  const rateLimitRes = await rateLimit(req, "write");
  if (rateLimitRes) return rateLimitRes;

  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const result = createEventSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "alumnus") return NextResponse.json({ error: "only alumni can create events" }, { status: 403 });

  const { title, description, date, virtual, location, cover } = result.data;
  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  // Quick fix: Since the DB splits User and Alumnus tables, we must ensure 
  // the user exists in Alumnus to satisfy the foreign key constraint.
  await prisma.alumnus.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: user.name || "Anonymous",
      avatar: user.avatar || "",
      coverColor: "#A8C09A",
      role: "Alumnus",
      company: "Independent",
      industry: "Technology",
      location: location || "Global",
      gradYear: user.gradYear || new Date().getFullYear(),
      major: user.major || "Unknown",
      university: user.university || "Unknown",
      bio: user.bio || "",
      expertise: user.interests || [],
      workHistory: user.experience || [],
      education: [],
      available: true,
      online: true,
    }
  });

  const event = await prisma.event.create({
    data: {
      id: "e" + Date.now(),
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

  return NextResponse.json({
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
}
