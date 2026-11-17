import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const target =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/courses";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing-code", request.url));
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(
      new URL("/login?error=supabase-not-configured", request.url),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=session-exchange-failed", request.url),
    );
  }

  return NextResponse.redirect(new URL(target, request.url));
}
