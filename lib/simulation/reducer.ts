import type {
  SimulationAction,
  SimulationFeedback,
  SimulationState,
} from "./types";
import { createFeedback } from "./state";
import { getPrimaryFile } from "./selectors";

function timestamp(actionAt?: string): string {
  return actionAt ?? new Date().toISOString();
}

function nextId(state: SimulationState, suffix: string): string {
  return `${state.runId}-${suffix}-${state.events.length + 1}`;
}

function applyResult(
  state: SimulationState,
  at: string,
  next: Partial<SimulationState>,
  event: {
    type: SimulationState["events"][number]["type"];
    label: string;
    tone: SimulationFeedback["tone"];
  },
  feedback: SimulationFeedback,
): SimulationState {
  return {
    ...state,
    ...next,
    updatedAt: at,
    events: [
      ...state.events,
      {
        id: nextId(state, event.type),
        type: event.type,
        at,
        label: event.label,
        tone: event.tone,
      },
    ],
    lastFeedback: feedback,
  };
}

function reject(
  state: SimulationState,
  at: string,
  message: string,
): SimulationState {
  return applyResult(
    state,
    at,
    {},
    {
      type: "action.rejected",
      label: `操作未执行：${message}`,
      tone: "error",
    },
    createFeedback("error", "前置条件未满足", message),
  );
}

function demoAssistantReply(prompt: string, mode: "ask" | "plan" | "build") {
  if (mode === "plan") {
    return [
      "演示计划：",
      "1. 使用明确的保存状态控制删除入口，而不是依赖 noteId 是否存在。",
      "2. 为新笔记补充回归测试。",
      "3. 先观察失败测试，再应用修复并重新验证。",
      `目标摘要：${prompt.slice(0, 80)}`,
    ].join("\n");
  }

  if (mode === "build") {
    return "演示补丁已准备：把 noteId 条件替换为 isSaved 条件。请在文件与差异中检查，再运行模拟测试。该响应来自确定性 Demo 适配器。";
  }

  return "根据当前演示数据，建议先明确“新笔记”和“已保存笔记”的状态差异，再用测试锁定验收条件。";
}

export function simulationReducer(
  state: SimulationState,
  action: SimulationAction,
): SimulationState {
  const at = timestamp(action.at);

  switch (action.type) {
    case "OPEN_EMAIL": {
      const emailId = action.emailId ?? "";
      if (!(emailId in state.emails)) {
        return reject(state, at, "找不到该邮件。");
      }
      return applyResult(
        state,
        at,
        {
          phase: state.phase === "briefing" ? "requirements" : state.phase,
          emails: {
            ...state.emails,
            [emailId]: { read: true, openedAt: at },
          },
        },
        {
          type: "email.opened",
          label: "打开任务邮件并标记为已读",
          tone: "success",
        },
        createFeedback(
          "success",
          "邮件已读",
          "任务邮件已标记为已读。接下来整理需求并保存。",
        ),
      );
    }

    case "SAVE_NOTES": {
      const content = action.content?.trim() ?? "";
      if (!content) {
        return reject(state, at, "项目说明不能为空。");
      }
      return applyResult(
        state,
        at,
        {
          phase:
            state.phase === "briefing" || state.phase === "requirements"
              ? "planning"
              : state.phase,
          notes: { savedContent: content, savedAt: at },
        },
        {
          type: "notes.saved",
          label: "保存项目需求与验收条件",
          tone: "success",
        },
        createFeedback(
          "success",
          "需求已保存",
          "内容已写入当前 Demo 运行，刷新页面仍会恢复。",
        ),
      );
    }

    case "SET_ASSISTANT_MODE": {
      const mode = action.mode ?? "ask";
      return applyResult(
        state,
        at,
        {
          assistant: { ...state.assistant, mode },
        },
        {
          type: "assistant.mode_changed",
          label: `切换助手模式为 ${mode.toUpperCase()}`,
          tone: "info",
        },
        createFeedback(
          "info",
          "模式已切换",
          mode === "build"
            ? "Build 模式可以应用演示补丁。"
            : `${mode.toUpperCase()} 模式只提供解释或计划。`,
        ),
      );
    }

    case "SEND_ASSISTANT": {
      const prompt = action.prompt?.trim() ?? "";
      if (!prompt) {
        return reject(state, at, "请先输入助手请求。");
      }
      if (!state.notes.savedAt) {
        return reject(state, at, "请先保存项目需求，再请求助手修改。");
      }
      const mode = state.assistant.mode;
      const userMessage = {
        id: `${state.runId}-user-${state.assistant.messages.length + 1}`,
        role: "user" as const,
        mode,
        content: prompt,
        at,
      };
      const assistantMessage = {
        id: `${state.runId}-assistant-${state.assistant.messages.length + 2}`,
        role: "assistant" as const,
        mode,
        content: demoAssistantReply(prompt, mode),
        at,
      };
      return applyResult(
        state,
        at,
        {
          assistant: {
            ...state.assistant,
            messages: [
              ...state.assistant.messages,
              userMessage,
              assistantMessage,
            ],
          },
        },
        {
          type: "assistant.message",
          label: `向演示助手发送 ${mode.toUpperCase()} 请求`,
          tone: "info",
        },
        createFeedback(
          "success",
          "演示助手已响应",
          mode === "build"
            ? "现在可以应用示例补丁并检查差异。"
            : "本轮没有修改文件。",
        ),
      );
    }

    case "APPLY_AI_EDIT": {
      const primary = getPrimaryFile(state);
      const hasBuildMessage = state.assistant.messages.some(
        (message) => message.role === "assistant" && message.mode === "build",
      );
      if (!primary) {
        return reject(state, at, "当前场景没有可修改文件。");
      }
      if (!hasBuildMessage) {
        return reject(state, at, "请先向 Build 模式助手发送修改请求。");
      }
      if (primary.content !== primary.baseline) {
        return reject(state, at, "示例补丁已经应用。");
      }
      return applyResult(
        state,
        at,
        {
          phase: "building",
          files: state.files.map((file, index) =>
            index === 0 ? { ...file, content: file.aiContent } : file,
          ),
          tests: {
            status: "idle",
            runCount: state.tests.runCount,
            output: "文件已变更，需重新运行模拟测试。",
          },
          git: {
            ...state.git,
            hasUncommittedChanges: true,
            stagedPaths: [],
            prStatus: "none",
          },
        },
        {
          type: "assistant.edit_applied",
          label: "应用演示助手建议并生成文件差异",
          tone: "success",
        },
        createFeedback(
          "success",
          "示例补丁已应用",
          "打开“文件与差异”查看修改；当前测试尚未验证。",
        ),
      );
    }

    case "RUN_TESTS": {
      const primary = getPrimaryFile(state);
      if (!primary) {
        return reject(state, at, "当前场景没有可测试文件。");
      }
      const passed = primary.content === primary.fixedContent;
      const runCount = state.tests.runCount + 1;
      return applyResult(
        state,
        at,
        {
          phase: passed ? "review" : "testing",
          tests: {
            status: passed ? "passed" : "failed",
            runCount,
            output: passed
              ? "PASS  4 tests\n✓ saved note keeps delete action\n✓ new note hides delete action\n✓ layout has one action bar\n✓ regression suite"
              : "FAIL  3 passed, 1 failed\n× new note should not render delete action\n  Expected: null\n  Received: <button>删除</button>\n\n提示：noteId 在新建记录中也可能存在。",
          },
        },
        {
          type: passed ? "tests.passed" : "tests.failed",
          label: passed ? "模拟回归测试通过" : "模拟测试失败并记录错误",
          tone: passed ? "success" : "error",
        },
        passed
          ? createFeedback(
              "success",
              "测试通过",
              "现在可以暂存并提交修改，再打开 PR。",
            )
          : createFeedback(
              "error",
              "测试未通过",
              "noteId 不能可靠表达“已保存”。应用演示修复后再次测试。",
            ),
      );
    }

    case "APPLY_FIX": {
      const primary = getPrimaryFile(state);
      if (!primary || state.tests.status !== "failed") {
        return reject(state, at, "请先运行测试并确认失败结果。");
      }
      if (primary.content === primary.fixedContent) {
        return reject(state, at, "修复已经应用。");
      }
      return applyResult(
        state,
        at,
        {
          files: state.files.map((file, index) =>
            index === 0 ? { ...file, content: file.fixedContent } : file,
          ),
          tests: {
            status: "idle",
            runCount: state.tests.runCount,
            output: "修复已应用，等待重新运行模拟测试。",
          },
          git: {
            ...state.git,
            hasUncommittedChanges: true,
            stagedPaths: [],
          },
        },
        {
          type: "fix.applied",
          label: "应用保存状态守卫修复",
          tone: "success",
        },
        createFeedback(
          "success",
          "修复已应用",
          "再次运行模拟测试，以实际结果决定是否允许提交。",
        ),
      );
    }

    case "STAGE_ALL": {
      if (state.tests.status !== "passed") {
        return reject(state, at, "测试未通过，不能暂存修改。");
      }
      if (!state.git.hasUncommittedChanges) {
        return reject(state, at, "没有可暂存的新修改。");
      }
      return applyResult(
        state,
        at,
        {
          git: {
            ...state.git,
            stagedPaths: state.files
              .filter((file) => file.content !== file.baseline)
              .map((file) => file.path),
          },
        },
        {
          type: "git.staged",
          label: "将已验证修改加入暂存区",
          tone: "success",
        },
        createFeedback(
          "success",
          "修改已暂存",
          "下一步提交应带有描述性信息。",
        ),
      );
    }

    case "COMMIT": {
      const message = action.message?.trim() ?? "";
      if (!state.git.stagedPaths.length) {
        return reject(state, at, "暂存区为空，不能提交。");
      }
      if (state.tests.status !== "passed") {
        return reject(state, at, "测试未通过，不能提交。");
      }
      if (!message) {
        return reject(state, at, "提交信息不能为空。");
      }
      const sha = `a${(state.git.commits.length + 24).toString(16)}f9c2`;
      return applyResult(
        state,
        at,
        {
          git: {
            ...state.git,
            stagedPaths: [],
            hasUncommittedChanges: false,
            commits: [
              ...state.git.commits,
              {
                sha,
                message,
                at,
                branch: state.git.branch,
              },
            ],
          },
        },
        {
          type: "git.committed",
          label: `提交修改 ${sha}`,
          tone: "success",
        },
        createFeedback(
          "success",
          "提交成功",
          "已记录到模拟分支，现在可以打开 Pull Request。",
        ),
      );
    }

    case "OPEN_PR": {
      if (!state.git.commits.length) {
        return reject(state, at, "没有提交，不能打开 PR。");
      }
      if (state.git.hasUncommittedChanges) {
        return reject(state, at, "仍有未提交修改，不能打开 PR。");
      }
      return applyResult(
        state,
        at,
        {
          phase: "review",
          git: { ...state.git, prStatus: "open" },
        },
        {
          type: "pr.opened",
          label: `打开 PR #${state.git.prNumber}`,
          tone: "success",
        },
        createFeedback(
          "success",
          "PR 已打开",
          "检查变更后批准 PR，才能继续正式发布。",
        ),
      );
    }

    case "REQUEST_CHANGES": {
      if (state.git.prStatus !== "open") {
        return reject(state, at, "只有开放中的 PR 可以请求修改。");
      }
      return applyResult(
        state,
        at,
        { git: { ...state.git, prStatus: "changes_requested" } },
        {
          type: "pr.changes_requested",
          label: `请求修改 PR #${state.git.prNumber}`,
          tone: "error",
        },
        createFeedback(
          "error",
          "审查要求修改",
          "PR 状态已变为需要修改，发布前置条件不会通过。",
        ),
      );
    }

    case "APPROVE_PR": {
      if (state.git.prStatus !== "open") {
        return reject(state, at, "PR 必须处于开放状态才能批准。");
      }
      return applyResult(
        state,
        at,
        {
          git: {
            ...state.git,
            prStatus: "approved",
            reviewedBy: "演示审查员",
          },
        },
        {
          type: "pr.approved",
          label: `批准 PR #${state.git.prNumber}`,
          tone: "success",
        },
        createFeedback(
          "success",
          "PR 已批准",
          "切换到模拟正式环境，然后检查所有发布条件。",
        ),
      );
    }

    case "SET_ENVIRONMENT": {
      const environment = action.environment ?? "local";
      return applyResult(
        state,
        at,
        { release: { ...state.release, environment } },
        {
          type: "environment.changed",
          label: environment === "production" ? "切换正式环境" : "切换本地环境",
          tone: "info",
        },
        createFeedback(
          "info",
          environment === "production" ? "已选择模拟正式环境" : "已选择本地环境",
          "环境切换只改变模拟状态，不会访问真实部署服务。",
        ),
      );
    }

    case "PUBLISH": {
      const blocking: string[] = [];
      if (state.release.environment !== "production") {
        blocking.push("选择模拟正式环境");
      }
      if (state.tests.status !== "passed") blocking.push("通过测试");
      if (!state.git.commits.length) blocking.push("提交修改");
      if (state.git.hasUncommittedChanges) blocking.push("清理未提交修改");
      if (state.git.prStatus !== "approved") blocking.push("批准 PR");

      if (blocking.length) {
        return reject(
          state,
          at,
          `发布前置条件未满足：请先${blocking.join("、")}。`,
        );
      }
      if (state.release.status === "released") {
        return reject(state, at, "该版本已经发布。");
      }
      return applyResult(
        state,
        at,
        {
          phase: "complete",
          release: {
            ...state.release,
            status: "released",
            releasedAt: at,
            url: `/demo/releases/${state.runId}`,
          },
        },
        {
          type: "release.completed",
          label: `发布 ${state.release.version} 到模拟正式环境`,
          tone: "success",
        },
        createFeedback(
          "success",
          "发布完成",
          "所有前置条件由实际状态验证。现在可以查看学习报告。",
        ),
      );
    }

    case "SAVE_SUMMARY": {
      const content = action.content?.trim() ?? "";
      if (!state.summary) {
        return reject(state, at, "当前场景没有摘要演示数据。");
      }
      if (!content) {
        return reject(state, at, "摘要不能为空。");
      }
      return applyResult(
        state,
        at,
        {
          summary: { ...state.summary, summary: content, savedAt: at },
        },
        {
          type: "summary.saved",
          label: "保存 Markdown 摘要",
          tone: "success",
        },
        createFeedback(
          "success",
          "摘要已保存",
          "这是本地演示数据，未执行上传、PDF 提取或模型调用。",
        ),
      );
    }

    default:
      return state;
  }
}
