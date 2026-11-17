import { describe, expect, it } from "vitest";
import { demoCourse, demoModule, demoScenario } from "@/content/courses";
import { simulationReducer } from "@/lib/simulation/reducer";
import { getScenarioProgress } from "@/lib/simulation/selectors";
import {
  createInitialSimulationState,
  resetSimulation,
} from "@/lib/simulation/state";
import type {
  SimulationAction,
  SimulationState,
} from "@/lib/simulation/types";
import { lineDiff } from "@/lib/text";

const location = {
  courseId: demoCourse.id,
  moduleId: demoModule.id,
  scenario: demoScenario,
};
const startedAt = "2026-11-16T09:00:00.000Z";
let tick = 0;

type ActionInput = SimulationAction extends infer Action
  ? Action extends unknown
    ? Omit<Action, "at">
    : never
  : never;

function act(state: SimulationState, action: ActionInput) {
  tick += 1;
  return simulationReducer(state, {
    ...action,
    at: `2026-11-16T09:${String(tick).padStart(2, "0")}:00.000Z`,
  } as SimulationAction);
}

function runnableState() {
  const initial = createInitialSimulationState(
    location,
    "run-test-fixed-id",
    startedAt,
  );
  return [
    { type: "OPEN_EMAIL", emailId: "release-brief" },
    {
      type: "SAVE_NOTES",
      content: "新笔记不应显示删除按钮；测试通过后才能提交。",
    },
    { type: "SET_ASSISTANT_MODE", mode: "build" },
    { type: "SEND_ASSISTANT", prompt: "准备最小修复" },
    { type: "APPLY_AI_EDIT" },
    { type: "RUN_TESTS" },
  ].reduce(
    (state, action) => act(state, action as ActionInput),
    initial,
  );
}

describe("demo simulation rules", () => {
  it("walks through the full state-guarded release flow", () => {
    let state = runnableState();

    expect(state.emails["release-brief"].read).toBe(true);
    expect(state.notes.savedContent).toContain("删除按钮");
    expect(state.files[0].content).not.toBe(state.files[0].baseline);
    expect(state.tests.status).toBe("failed");

    state = act(state, { type: "APPLY_FIX" });
    state = act(state, { type: "RUN_TESTS" });
    expect(state.tests.status).toBe("passed");

    state = act(state, { type: "STAGE_ALL" });
    expect(state.git.stagedPaths).toContain("components/NoteEditor.tsx");

    state = act(state, {
      type: "COMMIT",
      message: "fix: hide delete action for unsaved notes",
    });
    expect(state.git.commits).toHaveLength(1);
    expect(state.git.hasUncommittedChanges).toBe(false);

    state = act(state, { type: "OPEN_PR" });
    expect(state.git.prStatus).toBe("open");

    state = act(state, { type: "APPROVE_PR" });
    expect(state.git.prStatus).toBe("approved");

    state = act(state, { type: "SET_ENVIRONMENT", environment: "production" });
    state = act(state, { type: "PUBLISH" });

    expect(state.release.status).toBe("released");
    expect(state.phase).toBe("complete");
    expect(getScenarioProgress(demoScenario, state).complete).toBe(true);
    expect(state.events.some((event) => event.type === "release.completed")).toBe(
      true,
    );
  });

  it("blocks publishing before review and before commit", () => {
    let state = createInitialSimulationState(
      location,
      "run-release-guard",
      startedAt,
    );
    state = act(state, { type: "OPEN_EMAIL", emailId: "release-brief" });
    state = act(state, { type: "SET_ENVIRONMENT", environment: "production" });
    state = act(state, { type: "PUBLISH" });

    expect(state.release.status).toBe("draft");
    expect(state.lastFeedback?.tone).toBe("error");
    expect(state.events.at(-1)?.type).toBe("action.rejected");

    let tested = runnableState();
    tested = act(tested, { type: "APPLY_FIX" });
    tested = act(tested, { type: "RUN_TESTS" });
    tested = act(tested, {
      type: "SET_ENVIRONMENT",
      environment: "production",
    });
    tested = act(tested, { type: "PUBLISH" });

    expect(tested.tests.status).toBe("passed");
    expect(tested.git.commits).toHaveLength(0);
    expect(tested.release.status).toBe("draft");
    expect(tested.lastFeedback?.message).toContain("提交修改");
  });

  it("rejects staging changes while the test suite is failing", () => {
    const state = act(runnableState(), { type: "STAGE_ALL" });

    expect(state.git.stagedPaths).toHaveLength(0);
    expect(state.lastFeedback?.title).toBe("前置条件未满足");
    expect(state.lastFeedback?.message).toContain("测试未通过");
  });

  it("creates an isolated state when the demo restarts", () => {
    const previous = runnableState();
    const fresh = resetSimulation(location, "2026-11-16T10:00:00.000Z");

    expect(fresh.runId).not.toBe(previous.runId);
    expect(fresh.notes.savedContent).toBe("");
    expect(fresh.emails["release-brief"].read).toBe(false);
    expect(fresh.tests.status).toBe("idle");
    expect(fresh.git.commits).toHaveLength(0);
    expect(fresh.release.status).toBe("draft");
  });

  it("computes an added and removed line for the applied patch", () => {
    const initial = createInitialSimulationState(
      location,
      "run-diff",
      startedAt,
    );
    const applied = act(initial, { type: "OPEN_EMAIL", emailId: "release-brief" });
    const saved = act(applied, {
      type: "SAVE_NOTES",
      content: "验收条件已记录",
    });
    const built = act(saved, {
      type: "SET_ASSISTANT_MODE",
      mode: "build",
    });
    const requested = act(built, {
      type: "SEND_ASSISTANT",
      prompt: "准备修复",
    });
    const edited = act(requested, { type: "APPLY_AI_EDIT" });
    const primary = edited.files[0];
    const diff = lineDiff(primary.baseline, primary.content);

    expect(diff.some((line) => line.type === "added")).toBe(true);
    expect(diff.some((line) => line.type === "removed")).toBe(true);
  });
});
