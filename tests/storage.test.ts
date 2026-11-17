import { afterEach, describe, expect, it } from "vitest";
import { demoCourse, demoModule, demoScenario } from "@/content/courses";
import { createInitialSimulationState } from "@/lib/simulation/state";
import {
  loadActiveState,
  loadRunRecord,
  loadRunRecords,
  persistState,
} from "@/lib/simulation/storage";

const values = new Map<string, string>();
const storage = {
  getItem(key: string) {
    return values.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    values.set(key, value);
  },
  removeItem(key: string) {
    values.delete(key);
  },
};

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: storage,
    dispatchEvent: () => true,
  },
});

afterEach(() => {
  values.clear();
});

describe("demo storage", () => {
  it("restores the active state and a report-ready run record", () => {
    const state = createInitialSimulationState(
      {
        courseId: demoCourse.id,
        moduleId: demoModule.id,
        scenario: demoScenario,
      },
      "run-storage-test",
      "2026-11-16T09:00:00.000Z",
    );

    persistState(state);

    expect(loadActiveState(demoScenario.id)?.runId).toBe("run-storage-test");
    expect(loadRunRecords()).toHaveLength(1);
    expect(loadRunRecord("run-storage-test")?.state.phase).toBe("briefing");
  });
});
