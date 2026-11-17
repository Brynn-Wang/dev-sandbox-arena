import type { AssistantAdapter, AssistantRequest } from "./contracts";

export const demoAssistantAdapter: AssistantAdapter = {
  async generate(request: AssistantRequest) {
    const noteContext = request.context?.projectNotes
      ? "已读取保存的项目说明。"
      : "尚无项目说明上下文。";
    const modeLine =
      request.mode === "plan"
        ? "计划：定位状态来源，补充回归测试，再实施最小修改。"
        : request.mode === "build"
          ? "Build 演示：建议把保存状态作为显式输入，并先验证失败测试。"
          : "建议先比较新笔记和已保存笔记的状态差异。";

    return {
      adapter: "demo" as const,
      grader: "demo" as const,
      content: `${modeLine}\n${noteContext}\n\n用户目标：${request.prompt}`,
      evaluation: {
        intent:
          request.mode === "build"
            ? "edit"
            : request.mode === "plan"
              ? "plan"
              : "answer",
        summary: modeLine,
        coveredCriteria: [],
        evidenceQuotes: [request.prompt.slice(0, 500)],
      },
    };
  },
};
