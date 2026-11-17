import type {
  CompletionCondition,
  Course,
  FileSeed,
  LocalizedText,
  MessageSeed,
  Module,
  Scenario,
  SummaryDemo,
  Task,
  ToolId,
} from "./types";

export type PublicFileSeed = Pick<
  FileSeed,
  "path" | "name" | "language" | "initialContent"
>;

export type PublicScenario = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  brief: LocalizedText;
  stageLabel: LocalizedText;
  estimatedMinutes: number;
  enabledTools: ToolId[];
  taskSteps: Task[];
  initialFiles: PublicFileSeed[];
  messages: MessageSeed[];
  completionConditions: CompletionCondition[];
  feedbackPlaceholder: LocalizedText;
  summaryDemo?: SummaryDemo;
  isDemo: boolean;
};

export type PublicModule = Omit<Module, "scenarios"> & {
  scenarios: PublicScenario[];
};

export type PublicCourse = Omit<Course, "modules"> & {
  modules: PublicModule[];
};

export const DEFAULT_WORKSPACE_HREF =
  "/workspace/ai-software-engineering/release-defect/guided-demo";

export function toPublicScenario(scenario: Scenario): PublicScenario {
  return {
    id: scenario.id,
    title: scenario.title,
    summary: scenario.summary,
    brief: scenario.brief,
    stageLabel: scenario.stageLabel,
    estimatedMinutes: scenario.estimatedMinutes,
    enabledTools: scenario.enabledTools,
    taskSteps: scenario.taskSteps,
    initialFiles: scenario.initialFiles.map((file) => ({
      path: file.path,
      name: file.name,
      language: file.language,
      initialContent: file.initialContent,
    })),
    messages: scenario.messages,
    completionConditions: scenario.completionConditions,
    feedbackPlaceholder: scenario.feedbackPlaceholder,
    ...(scenario.summaryDemo ? { summaryDemo: scenario.summaryDemo } : {}),
    isDemo: scenario.isDemo,
  };
}

export function toPublicCourse(course: Course): PublicCourse {
  return {
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      scenarios: module.scenarios.map(toPublicScenario),
    })),
  };
}

export function workspaceHref(
  course: Pick<Course, "slug">,
  module: Pick<Module, "slug">,
  scenario: Pick<Scenario, "id">,
) {
  return `/workspace/${course.slug}/${module.slug}/${scenario.id}`;
}

export function findPublicCourse(
  courses: PublicCourse[],
  courseId: string,
) {
  return courses.find(
    (course) => course.id === courseId || course.slug === courseId,
  );
}

export function findPublicModule(
  courses: PublicCourse[],
  courseId: string,
  moduleId: string,
) {
  return findPublicCourse(courses, courseId)?.modules.find(
    (module) => module.id === moduleId || module.slug === moduleId,
  );
}

export function findPublicScenario(
  courses: PublicCourse[],
  courseId: string,
  moduleId: string,
  scenarioId: string,
) {
  return findPublicModule(courses, courseId, moduleId)?.scenarios.find(
    (scenario) => scenario.id === scenarioId,
  );
}
