"use client";

import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Cloud,
  Code2,
  File,
  FileDiff,
  FileText,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Globe2,
  Laptop,
  Mail,
  PanelTop,
  Play,
  Rocket,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  TestTube2,
  UploadCloud,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Scenario, ToolId } from "@/content/types";
import { text, toolLabels } from "@/content/ui";
import { getPrimaryFile, getReleaseChecks } from "@/lib/simulation/selectors";
import { useSimulation } from "@/lib/simulation/run-context";
import { lineDiff } from "@/lib/text";
import { Badge, Button, EmptyState, cn } from "../ui";

export function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-sm leading-6 text-[var(--ink)]">
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" />;
        if (line.startsWith("### ")) {
          return (
            <h4 key={index} className="pt-2 text-sm font-extrabold">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={index} className="pt-2 text-base font-black">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={index} className="text-xl font-black">
              {line.slice(2)}
            </h2>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--green-700)]" />
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-[var(--green-700)] bg-[var(--green-50)] px-3 py-2 text-xs text-[var(--muted)]"
            >
              {line.slice(2)}
            </blockquote>
          );
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

function ToolFrame({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[34rem] flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--green-100)] text-[var(--green-800)]">
            {icon}
          </span>
          <div>
            <h2 className="text-base font-extrabold">{title}</h2>
            <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
              {description}
            </p>
          </div>
        </div>
        {action}
      </div>
      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        {children}
      </div>
    </div>
  );
}

function TaskCenter({
  scenario,
  onOpenTool,
}: {
  scenario: Scenario;
  onOpenTool: (toolId: ToolId) => void;
}) {
  return (
    <ToolFrame
      icon={<PanelTop className="size-5" />}
      title="任务中心"
      description="目标、步骤、完成条件与提示集中在这里。"
    >
      <div className="rounded-2xl bg-[var(--green-950)] p-5 text-white">
        <Badge tone="lime">GUIDED DEMO</Badge>
        <h3 className="mt-4 text-2xl font-black tracking-[-0.03em]">
          {text(scenario.title, "zh")}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d2e0d6]">
          {text(scenario.brief, "zh")}
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {scenario.taskSteps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onOpenTool(step.toolId)}
            className="focus-ring group rounded-2xl border border-[var(--line)] bg-white p-4 text-left transition hover:border-[var(--green-700)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-7 place-items-center rounded-lg bg-[var(--green-50)] text-xs font-black text-[var(--green-800)]">
                {index + 1}
              </span>
              <ArrowRight className="size-4 text-[#aab9ad] transition group-hover:translate-x-0.5 group-hover:text-[var(--green-700)]" />
            </div>
            <p className="mt-4 text-sm font-extrabold">{text(step.title, "zh")}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              {text(step.description, "zh")}
            </p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--green-700)]">
              {toolLabels[step.toolId].zh}
            </p>
          </button>
        ))}
      </div>
    </ToolFrame>
  );
}

function MessagesTool({ scenario }: { scenario: Scenario }) {
  const { state, dispatch } = useSimulation();
  const [selectedId, setSelectedId] = useState(
    scenario.messages[0]?.id ?? "",
  );
  const selected = scenario.messages.find((message) => message.id === selectedId);
  const unread = Object.values(state.emails).filter((email) => !email.read).length;

  return (
    <ToolFrame
      icon={<Mail className="size-5" />}
      title="消息中心"
      description="任务邮件与团队消息；打开后会写入已读状态。"
      action={<Badge tone={unread ? "amber" : "green"}>{unread} 未读</Badge>}
    >
      {scenario.messages.length === 0 ? (
        <EmptyState
          title="尚无消息"
          description="该模块的消息将在课程配置中提供。"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="space-y-2">
            {scenario.messages.map((message) => {
              const read = state.emails[message.id]?.read;
              return (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(message.id);
                    dispatch({ type: "OPEN_EMAIL", emailId: message.id });
                  }}
                  className={cn(
                    "focus-ring w-full rounded-xl border p-3 text-left transition",
                    selectedId === message.id
                      ? "border-[var(--green-700)] bg-[var(--green-50)]"
                      : "border-[var(--line)] bg-white hover:bg-[#fafbf7]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[var(--muted)]">
                      {message.from}
                    </span>
                    <span className="text-[9px] text-[#9aab9e]">{message.time}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-bold leading-5">
                    {text(message.subject, "zh")}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {read ? (
                      <Check className="size-3 text-[var(--green-700)]" />
                    ) : (
                      <Circle className="size-2.5 fill-[var(--amber)] text-[var(--amber)]" />
                    )}
                    <span className="text-[9px] text-[var(--muted)]">
                      {read ? "已读" : "未读"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {selected ? (
            <article className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--green-700)]">
                    {selected.from}
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold">
                    {text(selected.subject, "zh")}
                  </h3>
                </div>
                <Badge tone={state.emails[selected.id]?.read ? "green" : "amber"}>
                  {state.emails[selected.id]?.read ? "已读" : "未读"}
                </Badge>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                {text(selected.body, "zh")}
              </p>
              {!state.emails[selected.id]?.read ? (
                <Button
                  className="mt-6"
                  onClick={() =>
                    dispatch({ type: "OPEN_EMAIL", emailId: selected.id })
                  }
                >
                  标记为已读
                  <Check className="size-4" />
                </Button>
              ) : (
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--green-50)] px-3 py-2 text-xs font-semibold text-[var(--green-800)]">
                  <CheckCircle2 className="size-4" />
                  已记录到当前学习运行
                </div>
              )}
            </article>
          ) : null}
        </div>
      )}
    </ToolFrame>
  );
}

function NotesTool({ scenario }: { scenario: Scenario }) {
  const { state, dispatch } = useSimulation();
  const [draft, setDraft] = useState(state.notes.savedContent);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const suggested = scenario.isDemo
    ? `# 缺陷与验收

- 新笔记未保存时隐藏删除入口
- 已保存笔记保留删除入口
- noteId 不能单独代表保存状态
- 回归测试通过后才可提交

风险：条件判断错误会导致布局含义不一致。`
    : "";

  return (
    <ToolFrame
      icon={<FileText className="size-5" />}
      title="项目说明 / 笔记"
      description="Markdown 编辑与预览；保存后刷新仍会恢复。"
      action={
        <div className="flex rounded-lg bg-[#edf1e8] p-1">
          {(["edit", "preview"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold",
                view === item ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)]",
              )}
            >
              {item === "edit" ? "编辑" : "预览"}
            </button>
          ))}
        </div>
      }
    >
      {view === "edit" ? (
        <div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="focus-ring min-h-[22rem] w-full resize-y rounded-2xl border border-[var(--line)] bg-[#fbfcf8] p-5 font-mono text-sm leading-7 text-[var(--ink)]"
            placeholder="记录缺陷、风险、验收条件与下一步…"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {suggested ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDraft(suggested)}
              >
                <Sparkles className="size-3.5" />
                填入演示需求
              </Button>
            ) : (
              <span className="text-xs text-[var(--muted)]">
                支持 Markdown 语法
              </span>
            )}
            <Button
              onClick={() => dispatch({ type: "SAVE_NOTES", content: draft })}
            >
              <Save className="size-4" />
              保存项目说明
            </Button>
          </div>
        </div>
      ) : (
        <div className="min-h-[22rem] rounded-2xl border border-[var(--line)] bg-white p-6">
          {draft.trim() ? (
            <MarkdownPreview content={draft} />
          ) : (
            <p className="text-sm text-[var(--muted)]">暂无内容。</p>
          )}
        </div>
      )}
      <p className="mt-4 text-[11px] text-[var(--muted)]">
        {state.notes.savedAt
          ? `最近保存：${new Date(state.notes.savedAt).toLocaleString("zh-CN")}`
          : "尚未保存"}
      </p>
    </ToolFrame>
  );
}

function FilesTool({ scenario }: { scenario: Scenario }) {
  const { state } = useSimulation();
  const primary = getPrimaryFile(state);
  const [selectedPath, setSelectedPath] = useState(
    primary?.path ?? scenario.initialFiles[0]?.path ?? "",
  );
  const selected = state.files.find((file) => file.path === selectedPath);
  const diff = selected ? lineDiff(selected.baseline, selected.content) : [];

  return (
    <ToolFrame
      icon={<FileDiff className="size-5" />}
      title="文件与代码"
      description="文件树、当前内容与相对初始版本的行级差异。"
      action={<Badge tone="neutral">READ ONLY</Badge>}
    >
      {state.files.length === 0 ? (
        <EmptyState
          title="暂无文件"
          description="该模块的文件将在课程配置中提供。"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-[14rem_minmax(0,1fr)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[#fbfcf8] p-2">
            <p className="px-2 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
              PROJECT
            </p>
            {state.files.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedPath(file.path)}
                className={cn(
                  "focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs",
                  selectedPath === file.path
                    ? "bg-[var(--green-100)] font-bold text-[var(--green-900)]"
                    : "text-[var(--muted)] hover:bg-white",
                )}
              >
                <File className="size-3.5 shrink-0" />
                <span className="truncate">{file.name}</span>
                {file.content !== file.baseline ? (
                  <span className="ml-auto size-1.5 rounded-full bg-[var(--amber)]" />
                ) : null}
              </button>
            ))}
          </div>
          {selected ? (
            <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                <div>
                  <p className="font-mono text-xs font-bold">{selected.path}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                    {selected.language}
                  </p>
                </div>
                <Badge tone={selected.content === selected.baseline ? "neutral" : "amber"}>
                  {selected.content === selected.baseline ? "未修改" : "已变更"}
                </Badge>
              </div>
              <div className="grid lg:grid-cols-2">
                <div className="border-b border-[var(--line)] bg-[#f8faf5] lg:border-b-0 lg:border-r">
                  <p className="border-b border-[var(--line)] px-4 py-2 text-[10px] font-black uppercase text-[var(--muted)]">
                    当前内容
                  </p>
                  <pre className="thin-scrollbar max-h-[25rem] overflow-auto p-4 font-mono text-[11px] leading-6">
                    {selected.content}
                  </pre>
                </div>
                <div>
                  <p className="border-b border-[var(--line)] px-4 py-2 text-[10px] font-black uppercase text-[var(--muted)]">
                    与初始版本比较
                  </p>
                  <div className="thin-scrollbar max-h-[25rem] overflow-auto p-2 font-mono text-[11px] leading-6">
                    {diff.map((line, index) => (
                      <div
                        key={`${index}-${line.text}`}
                        className={cn(
                          "flex min-h-6 whitespace-pre-wrap rounded px-2",
                          line.type === "added" && "bg-emerald-50 text-emerald-800",
                          line.type === "removed" && "bg-red-50 text-red-700",
                          line.type === "same" && "text-[var(--muted)]",
                        )}
                      >
                        <span className="mr-2 w-3 shrink-0 select-none opacity-60">
                          {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                        </span>
                        {line.text || " "}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </ToolFrame>
  );
}

function AssistantTool() {
  const { state, dispatch, mode: runMode } = useSimulation();
  const [prompt, setPrompt] = useState(
    "请修复新笔记错误显示删除按钮的问题，并说明需要补充的测试。",
  );
  const primary = getPrimaryFile(state);
  const editApplied = Boolean(
    primary && primary.content !== primary.baseline,
  );

  return (
    <ToolFrame
      icon={<Bot className="size-5" />}
      title="AI 助手"
      description="Ask、Plan、Build 模式共用同一消息记录；Demo 响应是确定性的。"
      action={
        <Badge tone="lime">
          <Sparkles className="size-3" />
          {runMode === "connected" ? "STRUCTURED EVALUATOR" : "DEMO ADAPTER"}
        </Badge>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="flex min-h-[27rem] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          <div className="thin-scrollbar flex-1 space-y-3 overflow-y-auto bg-[#fbfcf8] p-4">
            {state.assistant.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-5",
                  message.role === "user"
                    ? "ml-auto bg-[var(--green-800)] text-white"
                    : message.role === "system"
                      ? "border border-[var(--line)] bg-white text-[var(--muted)]"
                      : "border border-[var(--green-100)] bg-white text-[var(--ink)]",
                )}
              >
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.12em] opacity-65">
                  {message.role === "user" ? "YOU" : message.role.toUpperCase()} · {message.mode}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.evaluation ? (
                  <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.08em] opacity-60">
                    GRADER: {message.evaluation.grader} · EVIDENCE:{" "}
                    {message.evaluation.evidenceQuotes.length}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--line)] p-3">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
              className="focus-ring w-full resize-none rounded-xl border border-[var(--line)] bg-white p-3 text-xs leading-5"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] text-[var(--muted)]">
                当前模式：{state.assistant.mode.toUpperCase()}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  dispatch({ type: "SEND_ASSISTANT", prompt });
                  setPrompt("");
                }}
                disabled={!prompt.trim()}
              >
                <Send className="size-3.5" />
                发送请求
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
              助手模式
            </p>
            <div className="space-y-1.5">
              {([
                ["ask", "解释当前代码"],
                ["plan", "先制定方案"],
                ["build", "生成可审查修改"],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    dispatch({ type: "SET_ASSISTANT_MODE", mode })
                  }
                  className={cn(
                    "focus-ring flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold",
                    state.assistant.mode === mode
                      ? "bg-[var(--green-100)] text-[var(--green-900)]"
                      : "text-[var(--muted)] hover:bg-[#f5f7f2]",
                  )}
                >
                  <span className="flex flex-col items-start">
                    <span>{mode.toUpperCase()}</span>
                    <span className="text-[9px] font-medium text-[var(--muted)]">
                      {label}
                    </span>
                  </span>
                  {state.assistant.mode === mode ? (
                    <Check className="size-3.5" />
                  ) : (
                    <ChevronRight className="size-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--green-100)] bg-[var(--green-50)] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--green-800)]">
              修改建议
            </p>
            <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
              在 Build 模式发送请求后，可应用示例补丁并在文件工具中审查差异。
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 w-full"
              disabled={state.assistant.mode !== "build" || editApplied}
              onClick={() => dispatch({ type: "APPLY_AI_EDIT" })}
            >
              <Code2 className="size-3.5" />
              {editApplied ? "补丁已应用" : "应用示例补丁"}
            </Button>
          </div>
        </div>
      </div>
    </ToolFrame>
  );
}

function TestsTool() {
  const { state, dispatch } = useSimulation();
  const environment = state.release.environment;
  const statusTone =
    state.tests.status === "passed"
      ? "green"
      : state.tests.status === "failed"
        ? "red"
        : "neutral";

  return (
    <ToolFrame
      icon={<TestTube2 className="size-5" />}
      title="测试与预览"
      description="模拟真实测试状态；失败与通过会改变后续操作权限。"
      action={<Badge tone={statusTone}>{state.tests.status.toUpperCase()}</Badge>}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[#fbfcf8] p-3">
        <div className="flex rounded-lg bg-[#e9eee5] p-1">
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "SET_ENVIRONMENT", environment: "local" })
            }
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold",
              environment === "local" ? "bg-white shadow-sm" : "text-[var(--muted)]",
            )}
          >
            <Laptop className="size-3.5" />
            本地
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "SET_ENVIRONMENT", environment: "production" })
            }
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold",
              environment === "production" ? "bg-white shadow-sm" : "text-[var(--muted)]",
            )}
          >
            <Cloud className="size-3.5" />
            正式
          </button>
        </div>
        <span className="text-[11px] text-[var(--muted)]">
          当前：{environment === "local" ? "模拟 localhost" : "模拟正式环境"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[#15231e]">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
            <span className="size-2 rounded-full bg-[#e27467]" />
            <span className="size-2 rounded-full bg-[#e2bc67]" />
            <span className="size-2 rounded-full bg-[#74b88a]" />
            <span className="ml-3 font-mono text-[10px] text-[#9db1a5]">
              simulated-test-runner
            </span>
          </div>
          <pre
            className={cn(
              "thin-scrollbar min-h-64 overflow-auto whitespace-pre-wrap p-5 font-mono text-xs leading-6",
              state.tests.status === "failed"
                ? "text-[#f1a195]"
                : state.tests.status === "passed"
                  ? "text-[#a9ddb9]"
                  : "text-[#b7c8bd]",
            )}
          >
            {state.tests.output}
          </pre>
        </div>
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => dispatch({ type: "RUN_TESTS" })}
          >
            <Play className="size-4 fill-current" />
            运行模拟测试
          </Button>
          {state.tests.status === "failed" ? (
            <Button
              variant="secondary"
              className="w-full border-[var(--amber)] bg-[#fffaf0]"
              onClick={() => dispatch({ type: "APPLY_FIX" })}
            >
              <ShieldCheck className="size-4" />
              应用演示修复
            </Button>
          ) : null}
          <div className="rounded-xl border border-[var(--line)] bg-white p-3 text-[11px] leading-5 text-[var(--muted)]">
            <p className="font-bold text-[var(--ink)]">执行边界</p>
            <p className="mt-1">
              这里不运行真实命令。测试结果由当前文件状态决定，用于验证教学流程。
            </p>
          </div>
        </div>
      </div>
    </ToolFrame>
  );
}

function VersionTool() {
  const { state, dispatch } = useSimulation();
  const [message, setMessage] = useState(
    "fix: hide delete action for unsaved notes",
  );
  const currentCommit = state.git.commits.at(-1);

  return (
    <ToolFrame
      icon={<GitBranch className="size-5" />}
      title="版本协作"
      description="分支、暂存、提交和 PR 使用一条状态链；无法绕过前置条件。"
      action={<Badge tone="green">{state.git.branch}</Badge>}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-extrabold">
                <GitCommitHorizontal className="size-4 text-[var(--green-700)]" />
                工作区
              </h3>
              <Badge tone={state.git.hasUncommittedChanges ? "amber" : "neutral"}>
                {state.git.hasUncommittedChanges ? "有修改" : "干净"}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              {state.files.map((file) => {
                const staged = state.git.stagedPaths.includes(file.path);
                const changed = file.content !== file.baseline;
                return (
                  <div
                    key={file.path}
                    className="flex items-center gap-3 rounded-lg bg-[#f8faf5] px-3 py-2 font-mono text-[11px]"
                  >
                    <span
                      className={cn(
                        "w-4 text-center font-black",
                        staged ? "text-emerald-700" : changed ? "text-amber-700" : "text-[#a3b1a6]",
                      )}
                    >
                      {staged ? "A" : changed ? "M" : "·"}
                    </span>
                    <span className="truncate">{file.path}</span>
                    {staged ? (
                      <span className="ml-auto text-[9px] text-[var(--green-700)]">STAGED</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
            <h3 className="text-sm font-extrabold">提交历史</h3>
            <div className="mt-4 space-y-3">
              {state.git.commits.length ? (
                state.git.commits.map((commit) => (
                  <div key={commit.sha} className="flex gap-3">
                    <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-[var(--green-700)] bg-[var(--green-50)]">
                      <GitCommitHorizontal className="size-3.5 text-[var(--green-800)]" />
                    </span>
                    <div>
                      <p className="text-xs font-bold">{commit.message}</p>
                      <p className="mt-1 font-mono text-[9px] text-[var(--muted)]">
                        {commit.sha} · {commit.branch}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--muted)]">尚无提交。</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => dispatch({ type: "STAGE_ALL" })}
          >
            <Save className="size-4" />
            暂存已验证修改
          </Button>
          <div className="rounded-xl border border-[var(--line)] bg-white p-3">
            <label className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
              Commit message
            </label>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="focus-ring mt-2 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-xs"
            />
            <Button
              size="sm"
              className="mt-2 w-full"
              onClick={() => dispatch({ type: "COMMIT", message })}
              disabled={!currentCommit && !state.git.stagedPaths.length}
            >
              <GitCommitHorizontal className="size-3.5" />
              提交
            </Button>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-bold">
                <GitPullRequest className="size-4" />
                PR #{state.git.prNumber}
              </p>
              <Badge
                tone={
                  state.git.prStatus === "approved"
                    ? "green"
                    : state.git.prStatus === "open"
                      ? "amber"
                      : state.git.prStatus === "changes_requested"
                        ? "red"
                        : "neutral"
                }
              >
                {state.git.prStatus.toUpperCase()}
              </Badge>
            </div>
            {state.git.prStatus === "none" ? (
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={() => dispatch({ type: "OPEN_PR" })}
              >
                打开 PR
                <ArrowRight className="size-3.5" />
              </Button>
            ) : state.git.prStatus === "open" ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => dispatch({ type: "REQUEST_CHANGES" })}
                >
                  请求修改
                </Button>
                <Button
                  size="sm"
                  onClick={() => dispatch({ type: "APPROVE_PR" })}
                >
                  批准
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-[10px] leading-4 text-[var(--muted)]">
                {state.git.prStatus === "approved"
                  ? `已由 ${state.git.reviewedBy} 完成审查。`
                  : "PR 当前仍需要修改。"}
              </p>
            )}
          </div>
        </div>
      </div>
    </ToolFrame>
  );
}

function ReleaseTool() {
  const { state, dispatch } = useSimulation();
  const checks = getReleaseChecks(state);
  const ready = checks.every((check) => check.passed);

  return (
    <ToolFrame
      icon={<Rocket className="size-5" />}
      title="发布"
      description="发布条件来自测试、提交、工作区、PR 与环境状态。"
      action={
        <Badge tone={state.release.status === "released" ? "green" : ready ? "lime" : "neutral"}>
          {state.release.status === "released" ? "RELEASED" : ready ? "READY" : "NOT READY"}
        </Badge>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <div className="mb-5 flex rounded-xl bg-[#edf1e8] p-1">
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_ENVIRONMENT", environment: "local" })
              }
              className={cn(
                "flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg text-xs font-bold",
                state.release.environment === "local"
                  ? "bg-white text-[var(--ink)] shadow-sm"
                  : "text-[var(--muted)]",
              )}
            >
              <Laptop className="size-3.5" />
              本地环境
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_ENVIRONMENT", environment: "production" })
              }
              className={cn(
                "flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg text-xs font-bold",
                state.release.environment === "production"
                  ? "bg-white text-[var(--ink)] shadow-sm"
                  : "text-[var(--muted)]",
              )}
            >
              <Globe2 className="size-3.5" />
              正式环境
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                RELEASE CANDIDATE
              </p>
              <h3 className="mt-1 text-2xl font-black">{state.release.version}</h3>
            </div>
            <span className="grid size-12 place-items-center rounded-2xl bg-[var(--green-50)] text-[var(--green-800)]">
              <Rocket className="size-5" />
            </span>
          </div>
          <div className="mt-5 divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-center gap-3 px-3 py-3 text-xs"
              >
                {check.passed ? (
                  <CheckCircle2 className="size-4 text-[var(--green-700)]" />
                ) : (
                  <Circle className="size-4 text-[#bcc7be]" />
                )}
                <span className={check.passed ? "text-[var(--ink)]" : "text-[var(--muted)]"}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl bg-[var(--green-950)] p-4 text-white">
            <Globe2 className="size-5 text-lime-200" />
            <p className="mt-3 text-xs font-bold">部署目标</p>
            <p className="mt-1 text-[11px] leading-5 text-[#c7d8cd]">
              Vercel 模拟正式环境
            </p>
            <Badge tone="lime" className="mt-3">
              NO REAL DEPLOY
            </Badge>
          </div>
          <Button
            className="w-full bg-[var(--lime)] text-[var(--green-950)] hover:bg-[#cfe86b]"
            onClick={() => dispatch({ type: "PUBLISH" })}
            disabled={state.release.status === "released"}
          >
            <UploadCloud className="size-4" />
            {state.release.status === "released" ? "已发布" : "发布模拟版本"}
          </Button>
          {state.release.status === "released" ? (
            <div className="rounded-xl border border-[var(--green-100)] bg-[var(--green-50)] p-3">
              <p className="text-xs font-bold text-[var(--green-900)]">
                发布完成
              </p>
              <p className="mt-1 break-all font-mono text-[9px] leading-4 text-[var(--muted)]">
                {state.release.url}
              </p>
              <a
                href={`/records/${state.runId}`}
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--green-800)]"
              >
                查看学习报告 <ArrowRight className="size-3" />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </ToolFrame>
  );
}

function SummaryTool() {
  const { state, dispatch } = useSimulation();
  const [tab, setTab] = useState<"source" | "extracted" | "summary">("summary");
  const [draft, setDraft] = useState(state.summary?.summary ?? "");
  const [view, setView] = useState<"edit" | "preview">("edit");

  if (!state.summary) {
    return (
      <ToolFrame
        icon={<FileText className="size-5" />}
        title="文档摘要"
        description="上传、文本提取与摘要接口预留区。"
      >
        <EmptyState
          title="当前场景没有摘要演示"
          description="从课程列表进入“AI 摘要工作区”可查看已明确标注的演示摘要。"
        />
      </ToolFrame>
    );
  }

  return (
    <ToolFrame
      icon={<FileText className="size-5" />}
      title="文档摘要"
      description="原文、提取文本和 Markdown 摘要共用同一演示工作区。"
      action={<Badge tone="amber">演示数据</Badge>}
    >
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--amber)] bg-[#fffaf0] px-3 py-2.5 text-[11px] text-[#73581b]">
        <UploadCloud className="size-4 shrink-0" />
        <p>{text(state.summary.notice, "zh")} 上传、对象存储、PDF 提取与 LLM 调用尚未接入。</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[var(--line)] bg-[#fbfcf8] p-2">
          <p className="px-2 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
            DOCUMENTS
          </p>
          <button className="flex w-full items-start gap-2 rounded-xl bg-[var(--green-100)] p-3 text-left text-[var(--green-900)]">
            <FileText className="mt-0.5 size-4 shrink-0" />
            <span>
              <span className="block text-xs font-bold">
                {state.summary.fileName}
              </span>
              <span className="mt-1 block text-[9px]">
                {state.summary.fileType} · DEMO ONLY
              </span>
            </span>
          </button>
        </div>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
            <div className="flex rounded-lg bg-[#edf1e8] p-1">
              {([
                ["source", "原文"],
                ["extracted", "提取文本"],
                ["summary", "摘要"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-bold",
                    tab === value ? "bg-white shadow-sm" : "text-[var(--muted)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === "summary" ? (
              <div className="flex rounded-lg bg-[#edf1e8] p-1">
                <button
                  type="button"
                  onClick={() => setView("edit")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[10px] font-bold",
                    view === "edit" && "bg-white",
                  )}
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => setView("preview")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[10px] font-bold",
                    view === "preview" && "bg-white",
                  )}
                >
                  预览
                </button>
              </div>
            ) : null}
          </div>
          <div className="p-4">
            {tab === "source" ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                {state.summary.originalText}
              </p>
            ) : tab === "extracted" ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
                {state.summary.extractedText}
              </p>
            ) : view === "edit" ? (
              <div>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="focus-ring min-h-72 w-full resize-y rounded-xl border border-[var(--line)] bg-[#fbfcf8] p-4 font-mono text-xs leading-6"
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      dispatch({ type: "SAVE_SUMMARY", content: draft })
                    }
                  >
                    <Save className="size-3.5" />
                    保存摘要
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-72 rounded-xl bg-[#fbfcf8] p-5">
                <MarkdownPreview content={draft} />
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolFrame>
  );
}

export function ToolPanel({
  toolId,
  scenario,
  onOpenTool,
}: {
  toolId: ToolId;
  scenario: Scenario;
  onOpenTool: (toolId: ToolId) => void;
}) {
  switch (toolId) {
    case "task":
      return <TaskCenter scenario={scenario} onOpenTool={onOpenTool} />;
    case "messages":
      return <MessagesTool scenario={scenario} />;
    case "notes":
      return <NotesTool scenario={scenario} />;
    case "files":
      return <FilesTool scenario={scenario} />;
    case "assistant":
      return <AssistantTool />;
    case "tests":
      return <TestsTool />;
    case "version":
      return <VersionTool />;
    case "release":
      return <ReleaseTool />;
    case "summary":
      return <SummaryTool />;
    default:
      return null;
  }
}
