import "server-only";
import type { AssistantAdapter, AssistantRequest } from "./contracts";

export function isConnectedAiConfigured(): boolean {
  return Boolean(
    process.env.LLM_API_KEY &&
      process.env.LLM_BASE_URL &&
      process.env.LLM_MODEL,
  );
}

export const configuredAssistantAdapter: AssistantAdapter = {
  async generate(request: AssistantRequest) {
    const baseUrl = process.env.LLM_BASE_URL;
    const apiKey = process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL;

    if (!baseUrl || !apiKey || !model) {
      throw new Error("Connected AI environment is incomplete.");
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "你是教学模拟中的软件工程助手。只提供可审查、可测试的建议，不声称执行了真实命令。",
          },
          {
            role: "user",
            content: `${request.mode.toUpperCase()} 模式\n项目说明：${
              request.context?.projectNotes ?? "无"
            }\n请求：${request.prompt}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw new Error(`Configured model request failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Configured model returned no content.");

    return { adapter: "configured" as const, content };
  },
};
