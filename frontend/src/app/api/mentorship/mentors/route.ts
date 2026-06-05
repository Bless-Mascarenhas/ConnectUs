import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapAlumnus } from "@/lib/mappers";

export async function GET(req: NextRequest) {
  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await prisma.mentorProfile.findMany({ include: { alumnus: true } });
  return NextResponse.json(rows.map((m) => ({
    alumnusId: m.alumnusId,
    hourlyPrice: m.hourlyPrice,
    rating: m.rating,
    sessionsCompleted: m.sessionsCompleted,
    availability: m.availability as string[],
    alumnus: mapAlumnus(m.alumnus),
  })));
}
