import { assertConnectedConfiguration } from "@/lib/env";
import { listRuns } from "@/lib/server/runs";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    assertConnectedConfiguration();
    const { user } = await requireUser();
    return Response.json({ records: await listRuns(user.id) });
  } catch {
    return Response.json({ records: [] }, { status: 200 });
  }
}
