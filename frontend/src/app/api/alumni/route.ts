import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapAlumnus } from "@/lib/mappers";
import { rateLimit } from "@/lib/rateLimiter";

export async function GET(req: NextRequest) {
  const rateLimitRes = await rateLimit(req, "general");
  if (rateLimitRes) return rateLimitRes;

  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await prisma.alumnus.findMany();
  return NextResponse.json(rows.map(mapAlumnus));
}
