import "server-only";

import type { Scenario } from "@/content/types";
import { requireAdminSupabase } from "@/lib/supabase/admin";
import { HttpError } from "@/lib/supabase/server";
import { resetSimulation } from "@/lib/simulation/state";
import type {
  Event,
  RunRecord,
  SimulationState,
} from "@/lib/simulation/types";

export type ServerRunRow = {
  id: string;
  run_id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  scenario_id: string;
  state: SimulationState;
  revision: number;
  status: "in_progress" | "completed";
  outcome: string | null;
  started_at: string;
  updated_at: string;
};

function admin() {
  const db = requireAdminSupabase();
  if (!db) throw new HttpError(503, "Server learning records are not configured.");
  return db;
}

export function toClientState(state: SimulationState): SimulationState {
  return {
    ...state,
    files: state.files.map((file) => ({
      path: file.path,
      name: file.name,
      language: file.language,
      baseline: file.baseline,
      content: file.content,
    })),
  };
}

function toRunRecord(row: ServerRunRow): RunRecord {
  return {
    runId: row.run_id,
    courseId: row.course_id,
    moduleId: row.module_id,
    scenarioId: row.scenario_id,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    phase: row.state.phase,
    status: row.status,
    eventCount: row.state.events.length,
    state: toClientState(row.state),
    source: "remote",
  };
}

export async function loadRun(
  userId: string,
  scenarioId: string,
): Promise<ServerRunRow | null> {
  const { data, error } = await admin()
    .from("simulation_runs")
    .select("*")
    .eq("user_id", userId)
    .eq("scenario_id", scenarioId)
    .maybeSingle();
  if (error) throw new HttpError(503, "Could not load the connected run.");
  return (data as ServerRunRow | null) ?? null;
}

export async function startRun(
  userId: string,
  courseId: string,
  moduleId: string,
  scenario: Scenario,
): Promise<ServerRunRow> {
  const existing = await loadRun(userId, scenario.id);
  if (existing) return existing;

  const state = resetSimulation({ courseId, moduleId, scenario });
  const { data, error } = await admin()
    .from("simulation_runs")
    .insert({
      id: crypto.randomUUID(),
      run_id: state.runId,
      user_id: userId,
      course_id: courseId,
      module_id: moduleId,
      scenario_id: scenario.id,
      state,
      revision: 1,
      status: "in_progress",
      outcome: null,
      started_at: state.startedAt,
    })
    .select("*")
    .single();

  if (error?.code === "23505") {
    const raced = await loadRun(userId, scenario.id);
    if (raced) return raced;
  }
  if (error || !data) {
    throw new HttpError(503, "Could not start the connected run.");
  }
  return data as ServerRunRow;
}

export async function saveRunTransition(
  row: ServerRunRow,
  state: SimulationState,
  newEvents: Event[],
): Promise<ServerRunRow> {
  const { data, error } = await admin().rpc("apply_simulation_transition", {
    p_run_id: row.id,
    p_expected_revision: row.revision,
    p_state: state,
    p_status: state.phase === "complete" ? "completed" : "in_progress",
    p_outcome: state.phase,
    p_events: newEvents,
  });
  if (error) {
    if (error.code === "40001") {
      throw new HttpError(
        409,
        "This run changed in another tab. Reload before continuing.",
      );
    }
    throw new HttpError(503, "Could not save the connected run.");
  }
  return {
    ...row,
    state,
    revision: Number(data),
    status: state.phase === "complete" ? "completed" : "in_progress",
    outcome: state.phase,
    updated_at: new Date().toISOString(),
  };
}

export async function resetRun(
  row: ServerRunRow,
  courseId: string,
  moduleId: string,
  scenario: Scenario,
): Promise<ServerRunRow> {
  const state = resetSimulation({ courseId, moduleId, scenario });
  const { data, error } = await admin().rpc("reset_simulation_run", {
    p_run_id: row.id,
    p_expected_revision: row.revision,
    p_state: state,
  });
  if (error) {
    if (error.code === "40001") {
      throw new HttpError(409, "This run changed in another tab.");
    }
    throw new HttpError(503, "Could not reset the connected run.");
  }
  return {
    ...row,
    run_id: state.runId,
    state,
    revision: Number(data),
    status: "in_progress",
    outcome: null,
    started_at: state.startedAt,
    updated_at: new Date().toISOString(),
  };
}

export async function listRuns(userId: string): Promise<RunRecord[]> {
  const { data, error } = await admin()
    .from("simulation_runs")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);
  if (error) throw new HttpError(503, "Could not load learning records.");
  return ((data ?? []) as ServerRunRow[]).map(toRunRecord);
}

export async function findRunByPublicId(
  userId: string,
  runId: string,
): Promise<RunRecord | null> {
  const { data, error } = await admin()
    .from("simulation_runs")
    .select("*")
    .eq("user_id", userId)
    .eq("run_id", runId)
    .maybeSingle();
  if (error) throw new HttpError(503, "Could not load this run.");
  return data ? toRunRecord(data as ServerRunRow) : null;
}

export function runResponse(row: ServerRunRow) {
  return {
    runId: row.run_id,
    revision: row.revision,
    state: toClientState(row.state),
  };
}
