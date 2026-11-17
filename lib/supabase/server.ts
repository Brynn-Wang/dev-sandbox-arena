import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => {
            store.set(name, value, options);
          });
        } catch {
          // Server Components cannot mutate cookies. Route Handlers can.
        }
      },
    },
  });
}

export async function requireUser() {
  const db = await getServerSupabase();
  if (!db) {
    throw new HttpError(503, "Supabase is not configured.");
  }
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) {
    throw new HttpError(401, "Sign in to use connected learning records.");
  }
  return { db, user: data.user };
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: "Request failed." }, { status: 500 });
}
