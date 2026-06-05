import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimiter";
import { createCommentSchema } from "@/lib/validators";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const rateLimitRes = await rateLimit(req, "write");
  if (rateLimitRes) return rateLimitRes;

  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const result = createCommentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "post not found" }, { status: 404 });

  const comments = (post.comments || []) as Record<string, unknown>[];
  const newComment = {
    id: "c" + Date.now(),
    authorId: userId,
    body: result.data.body,
    createdAt: new Date().toISOString(),
  };

  await prisma.post.update({
    where: { id: params.id },
    data: { comments: [...comments, newComment] },
  });

  return NextResponse.json(newComment);
}
