import type {
  AssistantMessage,
  Event,
  FileRecord,
  SimulationFeedback,
  SimulationLocation,
  SimulationState,
} from "./types";

function createRunId(): string {
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createInitialSimulationState(
  location: SimulationLocation,
  runId = createRunId(),
  now = new Date().toISOString(),
): SimulationState {
  const { scenario } = location;
  const initialFiles: FileRecord[] = scenario.initialFiles.map((file) => ({
    path: file.path,
    name: file.name,
    language: file.language,
    baseline: file.initialContent,
    aiContent: file.aiContent,
    fixedContent: file.fixedContent,
    content: file.initialContent,
  }));
  const initialMessage: AssistantMessage = {
    id: `${runId}-assistant-welcome`,
    role: "system",
    mode: "ask",
    content:
      "演示适配器已就绪。切换到 Build，输入修改目标后可生成一个可审查的示例补丁。",
    at: now,
  };
  const startedEvent: Event = {
    id: `${runId}-event-1`,
    type: "run.started",
    at: now,
    label: "创建独立的 Demo 学习运行",
    tone: "info",
  };

  return {
    schemaVersion: 1,
    runId,
    courseId: location.courseId,
    moduleId: location.moduleId,
    scenarioId: scenario.id,
    startedAt: now,
    updatedAt: now,
    phase: "briefing",
    emails: Object.fromEntries(
      scenario.messages.map((message) => [message.id, { read: false }]),
    ),
    notes: { savedContent: "" },
    assistant: {
      mode: "ask",
      messages: [initialMessage],
    },
    files: initialFiles,
    tests: {
      status: "idle",
      runCount: 0,
      output: "尚未运行模拟测试。",
    },
    git: {
      branch: "feature/note-editor-guard",
      stagedPaths: [],
      hasUncommittedChanges: false,
      commits: [],
      prStatus: "none",
      prNumber: 24,
    },
    release: {
      environment: "local",
      status: "draft",
      version: "v0.8.0",
    },
    summary: scenario.summaryDemo
      ? {
          fileName: scenario.summaryDemo.fileName,
          fileType: scenario.summaryDemo.fileType,
          originalText: scenario.summaryDemo.originalText,
          extractedText: scenario.summaryDemo.extractedText,
          summary: scenario.summaryDemo.initialSummary,
          notice: scenario.summaryDemo.notice,
        }
      : undefined,
    events: [startedEvent],
    lastFeedback: {
      tone: "info",
      title: "运行已创建",
      message: "从右侧任务说明开始。所有状态只通过统一操作规则改变。",
    },
  };
}

export function resetSimulation(
  location: SimulationLocation,
  now = new Date().toISOString(),
): SimulationState {
  return createInitialSimulationState(location, createRunId(), now);
}

export function createFeedback(
  tone: SimulationFeedback["tone"],
  title: string,
  message: string,
): SimulationFeedback {
  return { tone, title, message };
}
