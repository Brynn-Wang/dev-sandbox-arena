import { AssistantRequestSchema } from "@/lib/ai/contracts";
import { evaluateAssistant } from "@/lib/ai/evaluate-assistant";

export async function POST(request: Request) {
  const parsed = AssistantRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid assistant request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    return Response.json(await evaluateAssistant(parsed.data));
  } catch {
    return Response.json(
      { error: "Assistant adapter failed. Check server configuration." },
      { status: 503 },
    );
  }
}
