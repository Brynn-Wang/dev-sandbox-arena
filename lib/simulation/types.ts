import type { LocalizedText, Scenario } from "@/content/types";

export type SimulationPhase =
  | "briefing"
  | "requirements"
  | "planning"
  | "building"
  | "testing"
  | "review"
  | "complete";

export type AssistantMode = "ask" | "plan" | "build";
export type TestStatus = "idle" | "failed" | "passed";
export type PrStatus = "none" | "open" | "changes_requested" | "approved";
export type ReleaseEnvironment = "local" | "production";
export type ReleaseStatus = "draft" | "released";
export type FeedbackTone = "info" | "success" | "error";

export interface EmailState {
  read: boolean;
  openedAt?: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant" | "system";
  mode: AssistantMode;
  content: string;
  at: string;
}

export interface FileRecord {
  path: string;
  name: string;
  language: string;
  baseline: string;
  aiContent: string;
  fixedContent: string;
  content: string;
}

export interface CommitRecord {
  sha: string;
  message: string;
  at: string;
  branch: string;
}

export interface GitState {
  branch: string;
  stagedPaths: string[];
  hasUncommittedChanges: boolean;
  commits: CommitRecord[];
  prStatus: PrStatus;
  prNumber: number;
  reviewedBy?: string;
}

export interface TestState {
  status: TestStatus;
  runCount: number;
  output: string;
}

export interface ReleaseState {
  environment: ReleaseEnvironment;
  status: ReleaseStatus;
  version: string;
  url?: string;
  releasedAt?: string;
}

export interface SummaryState {
  fileName: string;
  fileType: "PDF" | "TXT";
  originalText: string;
  extractedText: string;
  summary: string;
  notice: LocalizedText;
  savedAt?: string;
}

export interface SimulationFeedback {
  tone: FeedbackTone;
  title: string;
  message: string;
}

export type SimulationEventType =
  | "run.started"
  | "email.opened"
  | "notes.saved"
  | "assistant.mode_changed"
  | "assistant.message"
  | "assistant.edit_applied"
  | "tests.failed"
  | "tests.passed"
  | "fix.applied"
  | "git.staged"
  | "git.committed"
  | "pr.opened"
  | "pr.changes_requested"
  | "pr.approved"
  | "environment.changed"
  | "release.completed"
  | "summary.saved"
  | "action.rejected";

export interface Event {
  id: string;
  type: SimulationEventType;
  at: string;
  label: string;
  tone: FeedbackTone;
}

export interface SimulationState {
  schemaVersion: 1;
  runId: string;
  courseId: string;
  moduleId: string;
  scenarioId: string;
  startedAt: string;
  updatedAt: string;
  phase: SimulationPhase;
  emails: Record<string, EmailState>;
  notes: {
    savedContent: string;
    savedAt?: string;
  };
  assistant: {
    mode: AssistantMode;
    messages: AssistantMessage[];
  };
  files: FileRecord[];
  tests: TestState;
  git: GitState;
  release: ReleaseState;
  summary?: SummaryState;
  events: Event[];
  lastFeedback?: SimulationFeedback;
}

export interface RunRecord {
  runId: string;
  courseId: string;
  moduleId: string;
  scenarioId: string;
  startedAt: string;
  updatedAt: string;
  phase: SimulationPhase;
  status: "in_progress" | "completed";
  eventCount: number;
  state: SimulationState;
}

export interface SimulationLocation {
  courseId: string;
  moduleId: string;
  scenario: Scenario;
}

type ActionBase = { at?: string };

export type SimulationAction = ActionBase &
  (
    | { type: "OPEN_EMAIL"; emailId: string }
    | { type: "SAVE_NOTES"; content: string }
    | { type: "SET_ASSISTANT_MODE"; mode: AssistantMode }
    | { type: "SEND_ASSISTANT"; prompt: string }
    | { type: "APPLY_AI_EDIT" }
    | { type: "RUN_TESTS" }
    | { type: "APPLY_FIX" }
    | { type: "STAGE_ALL" }
    | { type: "COMMIT"; message: string }
    | { type: "OPEN_PR" }
    | { type: "REQUEST_CHANGES" }
    | { type: "APPROVE_PR" }
    | { type: "SET_ENVIRONMENT"; environment: ReleaseEnvironment }
    | { type: "PUBLISH" }
    | { type: "SAVE_SUMMARY"; content: string }
  );

export type Action = SimulationAction;
