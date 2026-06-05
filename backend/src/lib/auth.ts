import type { Request, Response, NextFunction } from "express";
import { createClient, type User as AuthUser } from "@supabase/supabase-js";
import { prisma } from "./prisma";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for auth. Set them in backend/.env"
  );
}

export const supabaseAdmin = createClient(supabaseUrl ?? "", serviceRoleKey ?? "");

function displayName(user: AuthUser): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (typeof meta?.full_name === "string" && meta.full_name.trim()) return meta.full_name.trim();
  if (typeof meta?.name === "string" && meta.name.trim()) return meta.name.trim();
  return user.email?.split("@")[0] ?? "User";
}

function avatarUrl(name: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent&radius=50`;
}

export async function ensureUserProfile(user: AuthUser) {
  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  if (existing) return existing;

  const name = displayName(user);
  return prisma.user.create({
    data: {
      id: user.id,
      name,
      avatar: avatarUrl(name),
      role: "student",
      major: "",
      gradYear: new Date().getFullYear() + 1,
      university: "",
      bio: "",
      stats: { connections: 0, pending: 0, events: 0, unread: 0 },
    },
  });
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ error: "Auth not configured on server" });
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.userId = data.user.id;
  req.authUser = data.user;
  await ensureUserProfile(data.user);
  next();
}
