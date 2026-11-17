import { getServerScenarioById } from "@/content/server-catalog";
import { evaluateAssistant } from "@/lib/ai/evaluate-assistant";
import { assertConnectedConfiguration } from "@/lib/env";
import {
  loadRun,
  resetRun,
  runResponse,
  saveRunTransition,
  startRun,
} from "@/lib/server/runs";
import {
  RunCommandSchema,
  toSimulationAction,
} from "@/lib/simulation/actions";
import { simulationReducer } from "@/lib/simulation/reducer";
import { errorResponse, HttpError, requireUser } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function GET(
  _request: Request,
  context: { params: Promise<{ scenarioId: string }> },
) {
  try {
    assertConnectedConfiguration();
    const { user } = await requireUser();
    const { scenarioId } = await context.params;
    const run = await loadRun(user.id, scenarioId);
    return Response.json({ view: run ? runResponse(run) : null });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ scenarioId: string }> },
) {
  try {
    assertConnectedConfiguration();
    const { user } = await requireUser();
    const { scenarioId } = await context.params;
    const full = getServerScenarioById(scenarioId);
    if (!full) throw new HttpError(404, "Scenario not found.");
    const parsed = RunCommandSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) throw new HttpError(400, "Invalid run command.");

    let row = await startRun(
      user.id,
      full.course.id,
      full.module.id,
      full.scenario,
    );

    if (parsed.data.command === "reset") {
      row = await resetRun(
        row,
        full.course.id,
        full.module.id,
        full.scenario,
      );
      return Response.json({ view: runResponse(row) });
    }

    const action = toSimulationAction(parsed.data.action);
    let internalAction = action;
    if (action.type === "SEND_ASSISTANT") {
      const evaluation = await evaluateAssistant({
        mode: row.state.assistant.mode,
        prompt: action.prompt,
        context: {
          scenarioId,
          projectNotes: row.state.notes.savedContent,
          acceptanceCriteria: full.scenario.completionConditions.map(
            (condition) => condition.label.zh,
          ),
        },
      });
      internalAction = {
        ...action,
        response: {
          content: evaluation.content,
          grader: evaluation.grader,
          intent: evaluation.evaluation.intent,
          coveredCriteria: evaluation.evaluation.coveredCriteria,
          evidenceQuotes: evaluation.evaluation.evidenceQuotes,
        },
      };
    }

    const previousEventCount = row.state.events.length;
    const nextState = simulationReducer(row.state, {
      ...internalAction,
      at: new Date().toISOString(),
    });
    const newEvents = nextState.events.slice(previousEventCount);
    row = await saveRunTransition(row, nextState, newEvents);
    return Response.json({ view: runResponse(row) });
  } catch (error) {
    return errorResponse(error);
  }
}
