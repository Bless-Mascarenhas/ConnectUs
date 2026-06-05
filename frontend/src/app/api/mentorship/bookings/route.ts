import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapAlumnus } from "@/lib/mappers";

export async function GET(req: NextRequest) {
  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await prisma.booking.findMany({
    where: { userId },
    include: { mentor: { include: { alumnus: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rows.map((b) => ({
    id: b.id,
    mentorId: b.mentorId,
    slot: b.slot.toISOString(),
    goal: b.goal,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    mentor: mapAlumnus(b.mentor.alumnus),
  })));
}
