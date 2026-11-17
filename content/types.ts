import { z } from "zod";

export const TOOL_IDS = [
  "task",
  "messages",
  "notes",
  "files",
  "assistant",
  "tests",
  "version",
  "release",
  "summary",
] as const;

export const ToolIdSchema = z.enum(TOOL_IDS);
export type ToolId = z.infer<typeof ToolIdSchema>;

export const LocalizedTextSchema = z.object({
  zh: z.string().min(1),
  en: z.string().min(1),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

export const FileSeedSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  language: z.string().min(1),
  initialContent: z.string(),
  aiContent: z.string(),
  fixedContent: z.string(),
});
export type FileSeed = z.infer<typeof FileSeedSchema>;

export const MessageSeedSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  subject: LocalizedTextSchema,
  time: z.string().min(1),
  body: LocalizedTextSchema,
  required: z.boolean().default(false),
});
export type MessageSeed = z.infer<typeof MessageSeedSchema>;

export const TaskStepSchema = z.object({
  id: z.string().min(1),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  toolId: ToolIdSchema,
});
export type Task = z.infer<typeof TaskStepSchema>;

export const CompletionConditionSchema = z.object({
  id: z.string().min(1),
  label: LocalizedTextSchema,
  description: LocalizedTextSchema,
});
export type CompletionCondition = z.infer<typeof CompletionConditionSchema>;

export const SummaryDemoSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum(["PDF", "TXT"]),
  originalText: z.string(),
  extractedText: z.string(),
  initialSummary: z.string(),
  notice: LocalizedTextSchema,
});
export type SummaryDemo = z.infer<typeof SummaryDemoSchema>;

export const ScenarioSchema = z.object({
  id: z.string().min(1),
  title: LocalizedTextSchema,
  summary: LocalizedTextSchema,
  brief: LocalizedTextSchema,
  stageLabel: LocalizedTextSchema,
  estimatedMinutes: z.number().int().positive(),
  enabledTools: z.array(ToolIdSchema).min(1),
  taskSteps: z.array(TaskStepSchema).min(1),
  initialFiles: z.array(FileSeedSchema),
  messages: z.array(MessageSeedSchema),
  completionConditions: z.array(CompletionConditionSchema).min(1),
  feedbackPlaceholder: LocalizedTextSchema,
  summaryDemo: SummaryDemoSchema.optional(),
  isDemo: z.boolean().default(false),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const ModuleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: LocalizedTextSchema,
  summary: LocalizedTextSchema,
  stage: LocalizedTextSchema,
  estimatedMinutes: z.number().int().positive(),
  readiness: z.enum(["ready", "placeholder"]),
  scenarios: z.array(ScenarioSchema).min(1),
});
export type Module = z.infer<typeof ModuleSchema>;

export const CourseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  level: LocalizedTextSchema,
  accent: z.enum(["mint", "lime", "amber"]),
  modules: z.array(ModuleSchema).min(1),
});
export type Course = z.infer<typeof CourseSchema>;

export const CourseConfigSchema = z.array(CourseSchema).min(1);
