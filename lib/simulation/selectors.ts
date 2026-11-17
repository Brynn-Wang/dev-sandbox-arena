import type { LocalizedText, Scenario } from "@/content/types";
import type { SimulationState } from "./types";

export function getPrimaryFile(state: SimulationState) {
  return state.files[0];
}

export function hasChangedFile(state: SimulationState): boolean {
  return state.files.some((file) => file.content !== file.baseline);
}

export function getStepCompletion(
  scenario: Scenario,
  state: SimulationState,
): Record<string, boolean> {
  const primaryFile = getPrimaryFile(state);
  const testsFailed = state.events.some((event) => event.type === "tests.failed");
  const assistantEditRequested = state.assistant.messages.some(
    (message) =>
      message.role === "user" &&
      message.mode === "build" &&
      message.content.trim().length > 0,
  );

  const known: Record<string, boolean> = {
    "read-email": Object.values(state.emails).some((email) => email.read),
    "save-notes": Boolean(state.notes.savedAt && state.notes.savedContent.trim()),
    "request-edit": Boolean(
      assistantEditRequested &&
        primaryFile &&
        primaryFile.content !== primaryFile.baseline,
    ),
    "run-tests": testsFailed && state.tests.status === "passed",
    deliver:
      state.git.commits.length > 0 &&
      state.git.prStatus === "approved",
    release: state.release.status === "released",
    report: state.release.status === "released",
    "inspect-file": state.files.length > 0,
    "edit-summary": Boolean(state.summary?.savedAt),
    "review-topics": true,
    "inspect-material": state.files.length > 0,
    "feature-brief": true,
    "connected-brief": false,
  };

  return Object.fromEntries(
    scenario.taskSteps.map((step) => [step.id, known[step.id] ?? false]),
  );
}

export function getScenarioProgress(
  scenario: Scenario,
  state: SimulationState,
): { completed: number; total: number; percent: number; complete: boolean } {
  const completion = getStepCompletion(scenario, state);
  const total = scenario.taskSteps.length;
  const completed = scenario.taskSteps.filter((step) => completion[step.id]).length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    complete: completed === total,
  };
}

export const phaseLabels: Record<
  SimulationState["phase"],
  LocalizedText
> = {
  briefing: { zh: "任务简报", en: "Briefing" },
  requirements: { zh: "需求澄清", en: "Requirements" },
  planning: { zh: "方案规划", en: "Planning" },
  building: { zh: "实现与差异", en: "Building" },
  testing: { zh: "测试与修复", en: "Testing" },
  review: { zh: "审查与发布", en: "Review" },
  complete: { zh: "已完成", en: "Complete" },
};

export function getReleaseChecks(
  state: SimulationState,
): Array<{ id: string; label: string; passed: boolean }> {
  return [
    {
      id: "tests",
      label: "模拟测试通过",
      passed: state.tests.status === "passed",
    },
    {
      id: "commit",
      label: "修改已提交",
      passed: state.git.commits.length > 0,
    },
    {
      id: "clean",
      label: "没有未提交修改",
      passed: !state.git.hasUncommittedChanges,
    },
    {
      id: "review",
      label: "PR 已批准",
      passed: state.git.prStatus === "approved",
    },
    {
      id: "production",
      label: "已选择正式环境",
      passed: state.release.environment === "production",
    },
  ];
}
