import { z } from "zod";

export const AssistantRequestSchema = z.object({
  mode: z.enum(["ask", "plan", "build"]),
  prompt: z.string().trim().min(1).max(4000),
  context: z
    .object({
      scenarioId: z.string().min(1),
      projectNotes: z.string().max(12000).default(""),
    })
    .optional(),
});

export type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

export type AssistantResponse = {
  adapter: "demo" | "configured";
  content: string;
};

export interface AssistantAdapter {
  generate(request: AssistantRequest): Promise<AssistantResponse>;
}
