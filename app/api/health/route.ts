import { isConnectedMode } from "@/lib/env";

export async function GET() {
  const connected = isConnectedMode();
  const configured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return Response.json(
    {
      status: connected && !configured ? "degraded" : "ok",
      mode: connected ? "connected" : "demo",
      dependencies: {
        supabase: configured ? "configured" : "not-configured",
        model:
          process.env.LLM_API_KEY &&
          process.env.LLM_BASE_URL &&
          process.env.LLM_MODEL
            ? "configured"
            : "keyword-fallback",
      },
      checkedAt: new Date().toISOString(),
    },
    { status: connected && !configured ? 503 : 200 },
  );
}
