import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { onboardingStepSchema } from "@/lib/validators";
import { mapMe } from "@/lib/mappers";

/**
 * PATCH — Save partial onboarding data at each step.
 * Each call persists immediately so progress is never lost.
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await authenticateRequest(req);
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const result = onboardingStepSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "no fields to update" }, { status: 400 });
    }

    const defaultData = {
      name: "",
      avatar: "",
      role: "student",
      major: "",
      gradYear: new Date().getFullYear(),
      university: "",
      bio: "",
      stats: { connections: 0, pending: 0, events: 0, unread: 0 },
    };

    const user = await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        ...defaultData,
        ...data,
      },
      update: data,
    });

    return NextResponse.json(mapMe(user));
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

/**
 * POST — Mark onboarding as complete.
 * Validates all required fields are present before allowing completion.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateRequest(req);
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

    // Validate required fields are filled
    const missing: string[] = [];
    if (!user.name?.trim()) missing.push("name");
    if (!user.university?.trim()) missing.push("university");
    if (!user.verificationDocUrl) missing.push("verification document");
    if (!user.bio?.trim()) missing.push("bio");
    if (!user.major?.trim()) missing.push("major");
    if (!user.gradYear) missing.push("graduation year");
    const interests = user.interests as string[] | null;
    if (!interests || interests.length === 0) missing.push("interests");
    if (!user.username?.trim()) missing.push("username");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missing },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { onboardingComplete: true },
    });

    return NextResponse.json({ success: true, user: mapMe(updated) });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
