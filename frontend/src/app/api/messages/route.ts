import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapAlumnus } from "@/lib/mappers";
import { rateLimit } from "@/lib/rateLimiter";
import { sendMessageSchema } from "@/lib/validators";


export async function POST(req: NextRequest) {
  const rateLimitRes = await rateLimit(req, "write");
  if (rateLimitRes) return rateLimitRes;

  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const result = sendMessageSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", details: result.error.flatten().fieldErrors }, { status: 400 });
  }
  const { conversationId, body: messageBody } = result.data;

  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return NextResponse.json({ error: "conversation not found" }, { status: 404 });
  if (convo.userId && convo.userId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const now = new Date();
  const msg = await prisma.message.create({
    data: {
      id: "m" + Date.now(),
      conversationId,
      senderId: userId,
      body: messageBody,
      createdAt: now,
      read: true,
    },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: now },
  });
  return NextResponse.json({ ...msg, createdAt: msg.createdAt.toISOString() });
}
