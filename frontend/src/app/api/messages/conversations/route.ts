import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapAlumnus } from "@/lib/mappers";
import { rateLimit } from "@/lib/rateLimiter";

export async function GET(req: NextRequest) {
  try {
    const rateLimitRes = await rateLimit(req, "general");
    if (rateLimitRes) return rateLimitRes;

    const userId = await authenticateRequest(req);
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const rows = await prisma.conversation.findMany({
      where: { userId },
      include: { participant: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { lastMessageAt: "desc" },
    });

    const enriched = rows.map((c) => {
      const last = c.messages[0];
      return {
        id: c.id,
        participantId: c.participantId,
        lastMessageAt: c.lastMessageAt.toISOString(),
        unread: c.unread,
        last: last ? { ...last, createdAt: last.createdAt.toISOString() } : undefined,
        participant: mapAlumnus(c.participant),
      };
    });
    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitRes = await rateLimit(req, "write");
    if (rateLimitRes) return rateLimitRes;

    const userId = await authenticateRequest(req);
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    if (!body.participantId || typeof body.participantId !== "string") {
      return NextResponse.json({ error: "Invalid participantId" }, { status: 400 });
    }

    let convo = await prisma.conversation.findFirst({
      where: { userId, participantId: body.participantId },
    });

    if (!convo) {
      convo = await prisma.conversation.create({
        data: {
          id: "c" + Date.now() + Math.random().toString(36).substring(7),
          userId,
          participantId: body.participantId,
          lastMessageAt: new Date(),
          unread: 0,
        },
      });
    }

    return NextResponse.json(convo);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
