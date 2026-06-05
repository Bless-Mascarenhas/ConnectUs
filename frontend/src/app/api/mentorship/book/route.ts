import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimiter";
import { bookMentorSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const rateLimitRes = await rateLimit(req, "write");
  if (rateLimitRes) return rateLimitRes;

  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const result = bookMentorSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { mentorId, slot, goal } = result.data;
  const booking = await prisma.booking.create({
    data: {
      id: "b" + Date.now(),
      userId,
      mentorId,
      slot: new Date(slot),
      goal: goal ?? "",
      status: "upcoming",
      createdAt: new Date(),
    },
  });
  return NextResponse.json({
    id: booking.id,
    mentorId: booking.mentorId,
    slot: booking.slot.toISOString(),
    goal: booking.goal,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  });
}
