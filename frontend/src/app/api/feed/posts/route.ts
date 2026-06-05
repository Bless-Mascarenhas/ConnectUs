import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapMe, mapPost } from "@/lib/mappers";
import { rateLimit } from "@/lib/rateLimiter";
import { createPostSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const rateLimitRes = await rateLimit(req, "write");
  if (rateLimitRes) return rateLimitRes;

  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const result = createPostSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { content, image } = result.data;
  const now = new Date();
  const row = await prisma.post.create({
    data: {
      id: "p" + Date.now(),
      authorId: userId,
      content,
      image: image ?? null,
      createdAt: now,
      reactions: [
        { emoji: "👏", count: 0 },
        { emoji: "💡", count: 0 },
        { emoji: "🎉", count: 0 },
        { emoji: "❤️", count: 0 },
      ],
      comments: [],
    },
  });
  const meUser = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ ...mapPost(row), author: meUser ? mapMe(meUser) : null });
}
