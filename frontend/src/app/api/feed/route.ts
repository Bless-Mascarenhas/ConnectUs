import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapMe, mapAlumnus, mapPost } from "@/lib/mappers";

export async function GET(req: NextRequest) {
  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [rows, meUser, alumniRows] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.alumnus.findMany(),
  ]);

  const alumniMap = new Map(alumniRows.map((a) => [a.id, mapAlumnus(a)]));
  
  const enriched = rows.map((r) => {
    let author: any = null;
    if (r.authorId === userId && meUser) author = mapMe(meUser);
    else if (alumniMap.has(r.authorId)) author = alumniMap.get(r.authorId);
    
    return { ...mapPost(r), author };
  });

  return NextResponse.json(enriched);
}
