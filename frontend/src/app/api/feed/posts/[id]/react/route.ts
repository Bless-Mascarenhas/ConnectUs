import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimiter";
import { reactSchema } from "@/lib/validators";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const rateLimitRes = await rateLimit(req, "write");
  if (rateLimitRes) return rateLimitRes;

  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const result = reactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { emoji } = result.data;
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "post not found" }, { status: 404 });

  let reactions = (post.reactions || []) as { emoji: string; count: number }[];
  let found = false;
  
  reactions = reactions.map(r => {
    if (r.emoji === emoji) {
      found = true;
      return { ...r, count: r.count + 1 };
    }
    return r;
  });

  if (!found) {
    reactions.push({ emoji, count: 1 });
  }

  await prisma.post.update({
    where: { id: params.id },
    data: { reactions },
  });

  return NextResponse.json({ success: true, reactions });
}
