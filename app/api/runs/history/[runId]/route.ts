import { assertConnectedConfiguration } from "@/lib/env";
import { findRunByPublicId } from "@/lib/server/runs";
import {
  errorResponse,
  HttpError,
  requireUser,
} from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ runId: string }> },
) {
  try {
    assertConnectedConfiguration();
    const { user } = await requireUser();
    const { runId } = await context.params;
    const record = await findRunByPublicId(user.id, runId);
    if (!record) throw new HttpError(404, "Run not found.");
    return Response.json({ record });
  } catch (error) {
    return errorResponse(error);
  }
}
