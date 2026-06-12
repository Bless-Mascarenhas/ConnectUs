import { createClient } from "@/lib/supabase/client";

// Use relative URL for client-side fetching, or absolute for server-side
const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative path
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Vercel deployment
  return "http://localhost:3000"; // dev server
};
const BASE = getBaseUrl();

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });
  
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.reason || errorData.error || `${res.status} ${res.statusText}`);
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(`${res.status} ${res.statusText}`);
    }
  }
  
  return res.json() as Promise<T>;
}
