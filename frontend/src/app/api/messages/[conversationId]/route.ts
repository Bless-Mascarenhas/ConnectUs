import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const convo = await prisma.conversation.findUnique({ where: { id: params.conversationId } });
  if (!convo) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (convo.userId && convo.userId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rows = await prisma.message.findMany({
    where: { conversationId: params.conversationId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.conversation.update({ where: { id: params.conversationId }, data: { unread: 0 } });
  await prisma.message.updateMany({
    where: { conversationId: params.conversationId, read: false },
    data: { read: true },
  });

  return NextResponse.json(rows.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
}
