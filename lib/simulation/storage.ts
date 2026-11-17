import { z } from "zod";
import type { RunRecord, SimulationState } from "./types";

const ACTIVE_KEY = "itera:demo:active-run:v1";
const RUNS_KEY = "itera:demo:runs:v1";
const EMPTY_RUNS: RunRecord[] = [];
let cachedRunsRaw: string | null | undefined;
let cachedRuns: RunRecord[] = EMPTY_RUNS;

const StoredStateSchema = z
  .object({
    schemaVersion: z.literal(1),
    runId: z.string().min(1),
    courseId: z.string().min(1),
    moduleId: z.string().min(1),
    scenarioId: z.string().min(1),
    startedAt: z.string().min(1),
    updatedAt: z.string().min(1),
    phase: z.string(),
    events: z.array(z.object({ id: z.string() })).default([]),
  })
  .catchall(z.unknown());

const StoredRunRecordSchema = z.object({
  runId: z.string().min(1),
  courseId: z.string().min(1),
  moduleId: z.string().min(1),
  scenarioId: z.string().min(1),
  startedAt: z.string().min(1),
  updatedAt: z.string().min(1),
  phase: z.string(),
  status: z.enum(["in_progress", "completed"]),
  eventCount: z.number().int().nonnegative(),
  state: StoredStateSchema,
});

const RunRecordsSchema = z.array(StoredRunRecordSchema);

function canUseStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

function toRunRecord(state: SimulationState): RunRecord {
  return {
    runId: state.runId,
    courseId: state.courseId,
    moduleId: state.moduleId,
    scenarioId: state.scenarioId,
    startedAt: state.startedAt,
    updatedAt: state.updatedAt,
    phase: state.phase,
    status: state.phase === "complete" ? "completed" : "in_progress",
    eventCount: state.events.length,
    state,
  };
}

export function loadActiveState(expectedScenarioId?: string): SimulationState | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const parsed = StoredStateSchema.parse(JSON.parse(raw));
    if (expectedScenarioId && parsed.scenarioId !== expectedScenarioId) return null;
    return parsed as unknown as SimulationState;
  } catch {
    return null;
  }
}

export function persistState(state: SimulationState): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(state));
    const records = loadRunRecords();
    const next = [
      toRunRecord(state),
      ...records.filter((record) => record.runId !== state.runId),
    ].slice(0, 20);
    window.localStorage.setItem(RUNS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("itera:runs-changed"));
  } catch {
    // Demo persistence is best-effort; the workspace remains usable if quota is full.
  }
}

export function loadRunRecords(): RunRecord[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(RUNS_KEY);
  if (raw === cachedRunsRaw) return cachedRuns;
  cachedRunsRaw = raw;
  if (!raw) {
    cachedRuns = EMPTY_RUNS;
    return cachedRuns;
  }
  try {
    cachedRuns = RunRecordsSchema.parse(JSON.parse(raw)) as unknown as RunRecord[];
  } catch {
    cachedRuns = EMPTY_RUNS;
  }
  return cachedRuns;
}

export function loadRunRecord(runId: string): RunRecord | null {
  return loadRunRecords().find((record) => record.runId === runId) ?? null;
}

export function getServerRunRecordsSnapshot(): RunRecord[] {
  return EMPTY_RUNS;
}

export function subscribeRunRecords(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const update = () => {
    cachedRunsRaw = undefined;
    listener();
  };
  window.addEventListener("itera:runs-changed", update);
  window.addEventListener("storage", update);
  return () => {
    window.removeEventListener("itera:runs-changed", update);
    window.removeEventListener("storage", update);
  };
}

export function clearDemoStorage(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ACTIVE_KEY);
  window.localStorage.removeItem(RUNS_KEY);
  window.dispatchEvent(new CustomEvent("itera:runs-changed"));
}
