import "server-only";

import {
  AssistantRequestSchema,
  type AssistantRequest,
  type AssistantResponse,
} from "./contracts";
import { demoAssistantAdapter } from "./demo-adapter";
import {
  configuredAssistantAdapter,
  isConnectedAiConfigured,
} from "./server-adapter";

function keywordEvaluation(request: AssistantRequest): AssistantResponse {
  const haystack = `${request.prompt}\n${request.context?.projectNotes ?? ""}`.toLowerCase();
  const criteria = request.context?.acceptanceCriteria ?? [];
  const coveredCriteria = criteria.filter((criterion) =>
    criterion
      .toLowerCase()
      .split(/[\s，。；、：,.;:]+/)
      .filter((token) => token.length >= 2)
      .every((token) => haystack.includes(token)),
  );

  return {
    adapter: "keyword",
    grader: "keyword",
    content:
      request.mode === "build"
        ? "关键词回退：先做最小可验证修改，保留失败测试作为证据，再请求审查。"
        : "关键词回退：先核对需求、验收条件和当前测试状态，再决定下一步。",
    evaluation: {
      intent:
        request.mode === "build"
          ? "edit"
          : request.mode === "plan"
            ? "plan"
            : "answer",
      summary: "模型不可用，已使用确定性关键词评估。",
      coveredCriteria,
      evidenceQuotes: [request.prompt.slice(0, 500)],
    },
  };
}

function constrainEvaluation(
  response: AssistantResponse,
  request: AssistantRequest,
): AssistantResponse {
  const allowed = new Set(request.context?.acceptanceCriteria ?? []);
  const source = `${request.prompt}\n${request.context?.projectNotes ?? ""}`;
  return {
    ...response,
    evaluation: {
      ...response.evaluation,
      coveredCriteria: response.evaluation.coveredCriteria.filter((item) =>
        allowed.has(item),
      ),
      evidenceQuotes: response.evaluation.evidenceQuotes.filter(
        (quote) => quote.trim().length > 0 && source.includes(quote),
      ),
    },
  };
}

export async function evaluateAssistant(
  input: unknown,
): Promise<AssistantResponse> {
  const parsed = AssistantRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid assistant request.");
  }
  const request = parsed.data;
  const demoMode = process.env.DEMO_MODE !== "false";
  const adapter =
    demoMode || !isConnectedAiConfigured()
      ? demoAssistantAdapter
      : configuredAssistantAdapter;

  try {
    return constrainEvaluation(await adapter.generate(request), request);
  } catch {
    return constrainEvaluation(keywordEvaluation(request), request);
  }
}
