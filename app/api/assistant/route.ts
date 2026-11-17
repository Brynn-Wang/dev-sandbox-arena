import { AssistantRequestSchema } from "@/lib/ai/contracts";
import { demoAssistantAdapter } from "@/lib/ai/demo-adapter";
import {
  configuredAssistantAdapter,
  isConnectedAiConfigured,
} from "@/lib/ai/server-adapter";

export async function POST(request: Request) {
  const parsed = AssistantRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid assistant request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const demoMode = process.env.DEMO_MODE !== "false";
  const adapter =
    demoMode || !isConnectedAiConfigured()
      ? demoAssistantAdapter
      : configuredAssistantAdapter;

  try {
    return Response.json(await adapter.generate(parsed.data));
  } catch {
    return Response.json(
      { error: "Assistant adapter failed. Check server configuration." },
      { status: 503 },
    );
  }
}
