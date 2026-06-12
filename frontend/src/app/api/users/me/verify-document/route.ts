import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Create a ratelimiter that allows 3 verification attempts per 10 minutes
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    analytics: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateRequest(req);
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    // 1. Rate Limiting Check
    if (ratelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const identifier = `verify_${userId}_${ip}`;
      const { success } = await ratelimit.limit(identifier);

      if (!success) {
        return NextResponse.json(
          { status: "rejected", reason: "Too many verification attempts. Please try again in 10 minutes." },
          { status: 429 } // Too Many Requests
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, university: true, verificationDocUrl: true },
    });

    if (!user || !user.verificationDocUrl) {
      return NextResponse.json({ error: "No document to verify" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Skipping verification.");
      return NextResponse.json({ skipped: true });
    }

    // Fetch the document from Supabase storage
    const response = await fetch(user.verificationDocUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to download document" }, { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get("content-type") || "image/jpeg";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a strict ID Verification Assistant for a university networking platform. 
Please analyze the attached document.
The user claims their name is "${user.name}" and their college/university is "${user.university}".
1. Is this a legitimate college-related document (e.g., Student ID card, admission letter, transcript, fee receipt)?
2. Does the text extracted from the document reasonably match the user's name and college? (Allow for minor abbreviations).
3. Are there obvious signs that this is a fake, heavily AI-generated, a random stock photo, or a meme?

Respond strictly with a valid JSON object in the exact format below, with no markdown formatting or extra text:
{
  "status": "approved" | "rejected",
  "reason": "Brief explanation of your decision"
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType,
        },
      },
    ]);

    const text = result.response.text();
    
    // Attempt to parse JSON response (handle potential markdown code blocks)
    let parsed: { status: string; reason: string };
    try {
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      parsed = { status: "rejected", reason: "Automated verification failed to understand the document." };
    }

    const finalStatus = parsed.status === "approved" ? "approved" : "rejected";

    await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: finalStatus },
    });

    return NextResponse.json({ status: finalStatus, reason: parsed.reason });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
