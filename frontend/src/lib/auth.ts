import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Extracts and verifies the Supabase JWT from the Authorization header.
 * Returns the userId if successful, otherwise null.
 */
export async function authenticateRequest(req: Request | NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  // Verify the JWT using the Supabase admin client
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user.id;
}
