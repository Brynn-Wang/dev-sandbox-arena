"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Cloud,
  Code2,
  FileText,
  GitBranch,
  ListChecks,
  Mail,
  PanelRight,
  Rocket,
  Save,
  Sparkles,
  TestTube2,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import type { Course, Module, Scenario, ToolId } from "@/content/types";
import { text, toolLabels } from "@/content/ui";
import { getScenarioProgress, phaseLabels } from "@/lib/simulation/selectors";
import {
  SimulationProvider,
  useSimulation,
} from "@/lib/simulation/run-context";
import type { RunMode } from "@/lib/simulation/run-store";
import { cn, Badge } from "../ui";
import { TaskSidebar } from "./task-sidebar";
import { ToolPanel } from "./tool-panels";

const toolIcons: Record<ToolId, typeof Mail> = {
  task: ListChecks,
  messages: Mail,
  notes: FileText,
  files: Code2,
  assistant: Sparkles,
  tests: TestTube2,
  version: GitBranch,
  release: Rocket,
  summary: FileText,
};

function WorkspaceSkeleton() {
  return (
    <div className="min-h-screen bg-[#f4f6ef] p-5">
      <div className="mx-auto max-w-[1600px] animate-pulse">
        <div className="h-16 rounded-2xl bg-white" />
        <div className="mt-4 grid min-h-[75vh] gap-4 lg:grid-cols-[220px_1fr_310px]">
          <div className="rounded-2xl bg-white" />
          <div className="rounded-2xl bg-white" />
          <div className="rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}

function WorkspaceContent({
  course,
  module,
  scenario,
  mode,
}: {
  course: Course;
  module: Module;
  scenario: Scenario;
  mode: RunMode;
}) {
  const { ready, state, pending, error } = useSimulation();
  const [activeTool, setActiveTool] = useState<ToolId>(
    scenario.enabledTools[0],
  );
  const [mobileView, setMobileView] = useState<"tool" | "task">("tool");
  const progress = getScenarioProgress(scenario, state);

  function openTool(toolId: ToolId) {
    if (!scenario.enabledTools.includes(toolId)) return;
    setActiveTool(toolId);
    setMobileView("tool");
  }

  if (!ready) return <WorkspaceSkeleton />;

  return (
    <div className="min-h-screen bg-[#f4f6ef]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:rgba(255,254,249,0.94)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center gap-4 px-4 sm:px-5">
          <Link
            href="/courses"
            className="focus-ring grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--green-50)]"
            aria-label="返回课程"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted)]">
              <span className="hidden sm:inline">{text(course.title, "zh")}</span>
              <span className="hidden text-[#bdc6be] sm:inline">/</span>
              <span>{text(module.title, "zh")}</span>
            </div>
            <h1 className="truncate text-sm font-black tracking-[-0.02em] sm:text-base">
              {text(scenario.title, "zh")}
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-xl bg-[var(--green-50)] px-3 py-2 text-[10px] font-bold text-[var(--green-800)] md:flex">
            <Save className="size-3.5" />
            {pending
              ? "正在保存"
              : mode === "connected"
                ? "已同步到服务端"
                : state.phase === "complete"
                  ? "已保存到本机"
                  : "自动保存到本机"}
          </div>
          <div className="hidden min-w-32 sm:block">
            <div className="flex justify-between text-[9px] font-bold text-[var(--muted)]">
              <span>{text(phaseLabels[state.phase], "zh")}</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e1e8dd]">
              <div
                className="h-full rounded-full bg-[var(--green-700)]"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
          <Badge tone="lime" className="hidden xl:inline-flex">
            <CircleDot className="size-3" />
            {mode === "connected" ? "CONNECTED" : "DEMO"}
          </Badge>
        </div>
        <div className="flex border-t border-[var(--line)] p-2 lg:hidden">
          <div className="grid w-full grid-cols-2 rounded-xl bg-[#edf1e8] p-1">
            <button
              type="button"
              onClick={() => setMobileView("tool")}
              className={cn(
                "flex min-h-9 items-center justify-center gap-2 rounded-lg text-xs font-bold",
                mobileView === "tool" && "bg-white shadow-sm",
              )}
            >
              <Wrench className="size-3.5" />
              工具
            </button>
            <button
              type="button"
              onClick={() => setMobileView("task")}
              className={cn(
                "flex min-h-9 items-center justify-center gap-2 rounded-lg text-xs font-bold",
                mobileView === "task" && "bg-white shadow-sm",
              )}
            >
              <PanelRight className="size-3.5" />
              任务说明
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="border-b border-[#e8d29d] bg-[#fff7df] px-4 py-3 text-center text-xs font-semibold text-[#72571d]">
          {error}{" "}
          {error.includes("Sign in") ? (
            <Link href="/login" className="underline">
              前往登录
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mx-auto max-w-[1600px]">
        <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-[220px_minmax(0,1fr)_310px]">
          <aside className="hidden border-r border-[var(--line)] bg-[#f9faf6] lg:block">
            <div className="sticky top-20 p-3">
              <div className="rounded-2xl bg-[var(--green-950)] p-4 text-white">
                <p className="text-[9px] font-bold tracking-[0.14em] text-[#9db5a7]">
                  MODULE
                </p>
                <p className="mt-2 text-sm font-extrabold leading-5">
                  {text(module.title, "zh")}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-[#bcd0c2]">
                  <CheckCircle2 className="size-3.5 text-lime-200" />
                  {text(module.stage, "zh")}
                </div>
              </div>
              <p className="mb-2 mt-5 px-2 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--muted)]">
                工作台工具
              </p>
              <nav className="space-y-1" aria-label="Workspace tools">
                {scenario.enabledTools.map((toolId) => {
                  const Icon = toolIcons[toolId];
                  return (
                    <button
                      key={toolId}
                      type="button"
                      onClick={() => openTool(toolId)}
                      className={cn(
                        "focus-ring flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition",
                        activeTool === toolId
                          ? "bg-white text-[var(--green-900)] shadow-[0_3px_12px_rgba(24,83,63,0.08)]"
                          : "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--ink)]",
                      )}
                    >
                      <Icon className="size-4" />
                      {toolLabels[toolId].zh}
                      {activeTool === toolId ? (
                        <span className="ml-auto size-1.5 rounded-full bg-[var(--green-700)]" />
                      ) : null}
                    </button>
                  );
                })}
              </nav>
              <div className="mt-5 rounded-xl border border-[var(--line)] bg-white p-3 text-[10px] leading-5 text-[var(--muted)]">
                <Cloud className="size-4 text-[var(--green-700)]" />
                <p className="mt-2 font-bold text-[var(--ink)]">Demo 模式</p>
                <p className="mt-1">状态保存在当前浏览器，不使用密钥。</p>
              </div>
            </div>
          </aside>

          <main
            className={cn(
              "min-w-0 bg-[#f4f6ef] p-3 sm:p-4",
              mobileView === "task" && "hidden lg:block",
            )}
          >
            <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
              {scenario.enabledTools.map((toolId) => (
                <button
                  key={toolId}
                  type="button"
                  onClick={() => openTool(toolId)}
                  className={cn(
                    "focus-ring shrink-0 rounded-lg px-3 py-2 text-[10px] font-bold",
                    activeTool === toolId
                      ? "bg-[var(--green-900)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--muted)]",
                  )}
                >
                  {toolLabels[toolId].zh}
                </button>
              ))}
            </div>
            <div className="min-h-[calc(100vh-9rem)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white lg:min-h-[calc(100vh-7.5rem)]">
              <ToolPanel
                key={`${activeTool}-${state.runId}`}
                toolId={activeTool}
                scenario={scenario}
                onOpenTool={openTool}
              />
            </div>
          </main>

          <div
            className={cn(
              "border-l border-[var(--line)]",
              mobileView === "tool" && "hidden lg:block",
            )}
          >
            <TaskSidebar
              scenario={scenario}
              onOpenTool={openTool}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceShell({
  course,
  module,
  scenario,
  mode = "demo",
}: {
  course: Course;
  module: Module;
  scenario: Scenario;
  mode?: RunMode;
}) {
  return (
    <SimulationProvider
      courseId={course.id}
      moduleId={module.id}
      scenario={scenario}
      mode={mode}
    >
      <WorkspaceContent
        course={course}
        module={module}
        scenario={scenario}
        mode={mode}
      />
    </SimulationProvider>
  );
}
