"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Lightbulb,
  ListChecks,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import type { Scenario } from "@/content/types";
import { text } from "@/content/ui";
import {
  getScenarioProgress,
  getStepCompletion,
  phaseLabels,
} from "@/lib/simulation/selectors";
import { useSimulation } from "@/lib/simulation/run-context";
import type { ToolId } from "@/content/types";
import { Badge, Button, ProgressBar, cn } from "../ui";

function conditionMet(id: string, state: ReturnType<typeof useSimulation>["state"]) {
  const checks: Record<string, boolean> = {
    "email-read": Object.values(state.emails).some((email) => email.read),
    "requirements-saved": Boolean(
      state.notes.savedContent.trim() && state.notes.savedAt,
    ),
    "tests-pass": state.tests.status === "passed",
    "pr-approved": state.git.prStatus === "approved",
    released: state.release.status === "released",
    "summary-saved": Boolean(state.summary?.savedAt),
  };
  return checks[id] ?? false;
}

export function TaskSidebar({
  scenario,
  onOpenTool,
  compact = false,
}: {
  scenario: Scenario;
  onOpenTool: (toolId: ToolId) => void;
  compact?: boolean;
}) {
  const { state, resetRun } = useSimulation();
  const completion = getStepCompletion(scenario, state);
  const progress = getScenarioProgress(scenario, state);
  const recentEvents = state.events.slice(-4).reverse();

  function handleReset() {
    if (
      window.confirm(
        "重新开始会保留当前运行到学习记录，并创建一个完全独立的新运行。继续吗？",
      )
    ) {
      resetRun();
    }
  }

  return (
    <aside
      className={cn(
        "thin-scrollbar flex flex-col gap-4 overflow-y-auto bg-[#f7f9f3] p-4",
        compact ? "h-full" : "h-[calc(100vh-5rem)]",
      )}
    >
      <section className="rounded-2xl border border-[var(--line)] bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--green-700)]">
              TASK BRIEF
            </p>
            <h2 className="mt-1 text-base font-extrabold leading-6">
              {text(scenario.title, "zh")}
            </h2>
          </div>
          <Badge tone={progress.complete ? "green" : "amber"}>
            {text(phaseLabels[state.phase], "zh")}
          </Badge>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          {text(scenario.brief, "zh")}
        </p>
        <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[var(--muted)]">
          <span>
            {progress.completed} / {progress.total}
          </span>
          <span>{progress.percent}%</span>
        </div>
        <ProgressBar value={progress.percent} className="mt-2" />
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="size-4 text-[var(--green-700)]" />
          <h3 className="text-xs font-black uppercase tracking-[0.12em]">
            任务步骤
          </h3>
        </div>
        <ol className="space-y-1">
          {scenario.taskSteps.map((step, index) => {
            const done = completion[step.id];
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onOpenTool(step.toolId)}
                  className="focus-ring group flex w-full items-start gap-2.5 rounded-xl px-1.5 py-2 text-left transition hover:bg-[var(--green-50)]"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                      done
                        ? "border-[var(--green-700)] bg-[var(--green-700)] text-white"
                        : "border-[#cbd6cc] bg-white text-[#9cad9f]",
                    )}
                  >
                    {done ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : (
                      <span className="text-[9px] font-bold">{index + 1}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-xs font-bold leading-5",
                        done && "text-[var(--muted)] line-through",
                      )}
                    >
                      {text(step.title, "zh")}
                    </span>
                    {!compact ? (
                      <span className="mt-0.5 block text-[10px] leading-4 text-[var(--muted)]">
                        {text(step.description, "zh")}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight className="mt-1 size-3.5 shrink-0 text-[#b4c0b6] transition group-hover:translate-x-0.5" />
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-4">
        <h3 className="flex items-center gap-2 text-xs font-black">
          <CheckCircle2 className="size-4 text-[var(--green-700)]" />
          完成条件
        </h3>
        <ul className="mt-3 space-y-2">
          {scenario.completionConditions.map((condition) => {
            const met = conditionMet(condition.id, state);
            return (
              <li
                key={condition.id}
                className="flex items-start gap-2 text-[11px] leading-4 text-[var(--muted)]"
              >
                {met ? (
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[var(--green-700)]" />
                ) : (
                  <Circle className="mt-0.5 size-3.5 shrink-0 text-[#b4c0b6]" />
                )}
                <span className={met ? "text-[var(--ink)]" : undefined}>
                  {text(condition.label, "zh")}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className={cn(
          "rounded-2xl border p-4",
          state.lastFeedback?.tone === "error"
            ? "border-red-200 bg-red-50/70"
            : state.lastFeedback?.tone === "success"
              ? "border-[var(--green-100)] bg-[var(--green-50)]"
              : "border-[var(--line)] bg-white",
        )}
      >
        <h3 className="flex items-center gap-2 text-xs font-black">
          {state.lastFeedback?.tone === "error" ? (
            <TriangleAlert className="size-4 text-[var(--danger)]" />
          ) : (
            <Lightbulb className="size-4 text-[var(--green-700)]" />
          )}
          最近反馈
        </h3>
        <p className="mt-2 text-xs font-bold">{state.lastFeedback?.title}</p>
        <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
          {state.lastFeedback?.message ?? "完成一个操作后，这里会显示系统反馈。"}
        </p>
      </section>

      {!compact ? (
        <section className="rounded-2xl border border-[var(--line)] bg-white p-4">
          <h3 className="flex items-center gap-2 text-xs font-black">
            <Clock3 className="size-4 text-[var(--green-700)]" />
            最近操作
          </h3>
          <div className="mt-3 space-y-2.5">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex gap-2.5">
                <span
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full",
                    event.tone === "error"
                      ? "bg-[var(--danger)]"
                      : event.tone === "success"
                        ? "bg-[var(--green-700)]"
                        : "bg-[#a9b7aa]",
                  )}
                />
                <div className="min-w-0">
                  <p className="text-[10px] leading-4 text-[var(--ink)]">
                    {event.label}
                  </p>
                  <p className="text-[9px] text-[#9aab9e]">
                    {new Date(event.at).toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {state.release.status === "released" ? (
        <Link
          href={`/records/${state.runId}`}
          className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--green-100)] bg-white px-3 text-xs font-bold text-[var(--green-800)] hover:bg-[var(--green-50)]"
        >
          查看学习报告
          <ArrowRight className="size-3.5" />
        </Link>
      ) : null}

      {!compact ? (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="size-3.5" />
          重新开始演示
        </Button>
      ) : null}
    </aside>
  );
}
