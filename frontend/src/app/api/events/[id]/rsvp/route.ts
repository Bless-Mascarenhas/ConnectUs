import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const rateLimitRes = await rateLimit(req, "write");
  if (rateLimitRes) return rateLimitRes;

  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const existing = await prisma.event.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  
  const isGoing = existing.attendees.includes(userId);
  const newAttendees = isGoing 
    ? existing.attendees.filter(id => id !== userId) 
    : [...existing.attendees, userId];

  const updated = await prisma.event.update({
    where: { id: params.id },
    data: { attendees: newAttendees, going: !isGoing },
  });
  return NextResponse.json({ id: updated.id, going: newAttendees.includes(userId) });
}
