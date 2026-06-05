import type { User as AuthUser } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      authUser?: AuthUser;
    }
  }
}

export {};
