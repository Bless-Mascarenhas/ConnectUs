import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapMe } from "@/lib/mappers";
import { rateLimit } from "@/lib/rateLimiter";
import { updateProfileSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const rateLimitRes = await rateLimit(req, "general");
    if (rateLimitRes) return rateLimitRes;

    const userId = await authenticateRequest(req);
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

    const convos = await prisma.conversation.findMany({ select: { unread: true } });
    const unreadCount = convos.reduce((acc, c) => acc + c.unread, 0);
    
    const stats = user.stats as { connections: number; pending: number; events: number; unread: number };
    stats.unread = unreadCount;
    user.stats = stats as any;

    return NextResponse.json(mapMe(user));
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const rateLimitRes = await rateLimit(req, "write");
  if (rateLimitRes) return rateLimitRes;

  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const result = updateProfileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = result.data;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return NextResponse.json(mapMe(user));
}
