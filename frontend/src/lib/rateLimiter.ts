import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let upstashGeneralLimiter: Ratelimit | null = null;
let upstashWriteLimiter: Ratelimit | null = null;

if (hasRedis) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  upstashGeneralLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
  });

  upstashWriteLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
  });
}

// Simple in-memory fallback for local dev
const localHits = new Map<string, { count: number; expiresAt: number }>();
function checkLocalRateLimit(ip: string, limit: number): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  let record = localHits.get(ip);
  if (!record || record.expiresAt < now) {
    record = { count: 1, expiresAt: now + windowMs };
  } else {
    record.count++;
  }
  localHits.set(ip, record);
  return record.count <= limit;
}

export async function rateLimit(req: NextRequest, type: "general" | "write" = "general"): Promise<NextResponse | null> {
  const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
  
  if (hasRedis) {
    const limiter = type === "general" ? upstashGeneralLimiter! : upstashWriteLimiter!;
    const { success, limit, reset, remaining } = await limiter.limit(`${type}_${ip}`);
    
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        }
      });
    }
    return null; // Null means success, proceed
  } else {
    // Local fallback
    const limit = type === "general" ? 100 : 20;
    const success = checkLocalRateLimit(`${type}_${ip}`, limit);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }
    return null;
  }
}
