import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { mapAlumnus } from "@/lib/mappers";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await authenticateRequest(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const alumnus = await prisma.alumnus.findUnique({ where: { id: params.id } });
  if (!alumnus) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(mapAlumnus(alumnus));
}
