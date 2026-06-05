import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { alumniId: string } }) {
  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { alumniId } = params;
  const existing = await prisma.connection.findUnique({
    where: { userId_alumniId: { userId, alumniId } },
  });
  if (existing) return NextResponse.json({ id: existing.id, alumniId, connected: true });

  const conn = await prisma.connection.create({
    data: { userId, alumniId },
  });
  // Update stats.connections count
  const count = await prisma.connection.count({ where: { userId } });
  
  // Also we need to make sure we keep the existing stats and just update connections
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const stats = user.stats as { connections: number; pending: number; events: number; unread: number };
    stats.connections = count;
    await prisma.user.update({
      where: { id: userId },
      data: { stats: stats as any },
    });
  }

  return NextResponse.json({ id: conn.id, alumniId, connected: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { alumniId: string } }) {
  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { alumniId } = params;
  await prisma.connection.deleteMany({ where: { userId, alumniId } });
  
  const count = await prisma.connection.count({ where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const stats = user.stats as { connections: number; pending: number; events: number; unread: number };
    stats.connections = count;
    await prisma.user.update({
      where: { id: userId },
      data: { stats: stats as any },
    });
  }

  return NextResponse.json({ alumniId, connected: false });
}
