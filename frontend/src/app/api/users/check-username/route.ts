import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateRequest(req);
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const username = req.nextUrl.searchParams.get("username")?.trim().toLowerCase();
    if (!username || username.length < 3 || username.length > 20) {
      return NextResponse.json({ available: false, reason: "Username must be 3–20 characters" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ available: false, reason: "Only letters, numbers, and underscores allowed" });
    }

    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    // Available if no one has it, or the current user already owns it
    const available = !existing || existing.id === userId;

    return NextResponse.json({ available });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
