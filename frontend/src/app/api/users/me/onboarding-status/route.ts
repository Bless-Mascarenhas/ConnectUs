import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateRequest(req);
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingComplete: true,
        name: true,
        university: true,
        major: true,
        username: true,
      },
    });

    if (!user) {
      // User hasn't been created in our DB yet (first API call after signup)
      return NextResponse.json({ onboardingComplete: false });
    }

    if (user.onboardingComplete) {
      return NextResponse.json({ onboardingComplete: true });
    }

    // If they have key profile fields filled, they are an existing user.
    // Auto-complete onboarding for them so they are not forced to redo it.
    if (user.name && user.university && user.major) {
      const baseUsername = user.name.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 15);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const defaultUsername = user.username || `${baseUsername}_${randomSuffix}`;

      await prisma.user.update({
        where: { id: userId },
        data: {
          onboardingComplete: true,
          username: defaultUsername,
        },
      });
      return NextResponse.json({ onboardingComplete: true });
    }

    return NextResponse.json({ onboardingComplete: false });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
