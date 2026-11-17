import "server-only";

import { createClient } from "@supabase/supabase-js";

export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key.replace(/\s+/g, ""), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function requireAdminSupabase() {
  const client = getAdminSupabase();
  if (!client) {
    throw new Error("Server learning records are not configured.");
  }
  return client;
}
