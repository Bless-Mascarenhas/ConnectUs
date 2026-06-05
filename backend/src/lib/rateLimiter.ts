import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- IN-MEMORY FALLBACKS ---
const memoryGeneralLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please slow down." },
});

const memoryWriteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: "Too many write requests. Please slow down." },
});

// --- UPSTASH REDIS SETUP ---
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

/** Hybrid General Limiter: Uses Upstash Redis if configured, otherwise Memory */
export const generalLimiter = async (req: Request, res: Response, next: NextFunction) => {
  if (!upstashGeneralLimiter) {
    return memoryGeneralLimiter(req, res, next);
  }

  const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
  const { success, limit, reset, remaining } = await upstashGeneralLimiter.limit(`general_${ip}`);
  
  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);

  if (!success) {
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }
  next();
};

/** Hybrid Write Limiter: Uses Upstash Redis if configured, otherwise Memory */
export const writeLimiter = async (req: Request, res: Response, next: NextFunction) => {
  if (!upstashWriteLimiter) {
    return memoryWriteLimiter(req, res, next);
  }

  const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
  const { success, limit, reset, remaining } = await upstashWriteLimiter.limit(`write_${ip}`);

  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);

  if (!success) {
    return res.status(429).json({ error: "Too many write requests. Please slow down." });
  }
  next();
};
