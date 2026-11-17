import { z } from "zod";

export const AssistantRequestSchema = z.object({
  mode: z.enum(["ask", "plan", "build"]),
  prompt: z.string().trim().min(1).max(4000),
  context: z
    .object({
      scenarioId: z.string().min(1),
      projectNotes: z.string().max(12000).default(""),
      acceptanceCriteria: z.array(z.string().max(300)).max(20).default([]),
    })
    .optional(),
});

export type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

export const AssistantEvaluationSchema = z.object({
  intent: z.enum(["answer", "plan", "edit", "review"]),
  summary: z.string().trim().min(1).max(4000),
  coveredCriteria: z.array(z.string().max(200)).max(20).default([]),
  evidenceQuotes: z.array(z.string().max(500)).max(12).default([]),
});

export type AssistantEvaluation = z.infer<typeof AssistantEvaluationSchema>;

export type AssistantResponse = {
  adapter: "demo" | "configured" | "keyword";
  grader: "demo" | "model" | "keyword";
  content: string;
  evaluation: AssistantEvaluation;
};

export interface AssistantAdapter {
  generate(request: AssistantRequest): Promise<AssistantResponse>;
}
