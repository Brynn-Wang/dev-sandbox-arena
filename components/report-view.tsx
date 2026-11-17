"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileBarChart2,
  Info,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  findPublicScenario,
  type PublicCourse,
} from "@/content/public-catalog";
import { text } from "@/content/ui";
import { phaseLabels } from "@/lib/simulation/selectors";
import { useRunRecord } from "@/lib/simulation/use-run-records";
import { Badge, EmptyState, cn } from "./ui";

export function ReportView({
  runId,
  courses,
}: {
  runId: string;
  courses: PublicCourse[];
}) {
  const record = useRunRecord(runId);

  if (!record) {
    return (
      <EmptyState
        title="找不到这次运行"
        description="记录可能来自其他浏览器、已被清理，或链接不完整。Demo 记录不会跨设备同步。"
        action={
          <Link
            href="/records"
            className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--green-800)] px-4 text-sm font-bold text-white"
          >
            <ArrowLeft className="size-4" />
            返回学习记录
          </Link>
        }
      />
    );
  }

  const state = record.state;
  const scenario = findPublicScenario(
    courses,
    record.courseId,
    record.moduleId,
    record.scenarioId,
  );
  const durationMinutes = Math.max(
    1,
    Math.round(
      (new Date(record.updatedAt).getTime() -
        new Date(record.startedAt).getTime()) /
        60000,
    ),
  );
  const aiGraders = [
    ...new Set(
      state.assistant.messages
        .map((message) => message.evaluation?.grader)
        .filter((value): value is "demo" | "model" | "keyword" => Boolean(value)),
    ),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/records"
          className="focus-ring inline-flex items-center gap-2 rounded-lg text-xs font-bold text-[var(--green-800)]"
        >
          <ArrowLeft className="size-3.5" />
          返回学习记录
        </Link>
        <Badge tone={record.status === "completed" ? "green" : "amber"}>
          {record.status === "completed" ? "已完成" : "进行中"}
        </Badge>
      </div>

      <div className="mt-5 rounded-[1.8rem] bg-[var(--green-950)] p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-lime-200">
              LEARNING REPORT · {record.source === "remote" ? "CONNECTED" : "DEMO"}
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              {scenario ? text(scenario.title, "zh") : "学习运行报告"}
            </h1>
            <p className="mt-3 font-mono text-[10px] text-[#9fb8aa]">
              RUN {record.runId}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/[0.07] px-4 py-3">
              <p className="text-lg font-black">{state.events.length}</p>
              <p className="mt-1 text-[9px] text-[#aac0b3]">操作事件</p>
            </div>
            <div className="rounded-xl bg-white/[0.07] px-4 py-3">
              <p className="text-lg font-black">{durationMinutes}m</p>
              <p className="mt-1 text-[9px] text-[#aac0b3]">记录时长</p>
            </div>
            <div className="rounded-xl bg-white/[0.07] px-4 py-3">
              <p className="text-lg font-black">{state.tests.runCount}</p>
              <p className="mt-1 text-[9px] text-[#aac0b3]">测试次数</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold">
              <Clock3 className="size-4 text-[var(--green-700)]" />
              运行状态
            </h2>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">开始时间</dt>
                <dd className="text-right font-semibold">
                  {new Date(record.startedAt).toLocaleString("zh-CN")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">当前阶段</dt>
                <dd className="font-semibold">
                  {text(phaseLabels[state.phase], "zh")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">测试状态</dt>
                <dd className="font-semibold">
                  {state.tests.status === "passed"
                    ? "通过"
                    : state.tests.status === "failed"
                      ? "失败"
                      : "未完成"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">PR 状态</dt>
                <dd className="font-semibold">{state.git.prStatus}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">发布状态</dt>
                <dd className="font-semibold">
                  {state.release.status === "released" ? "已发布" : "未发布"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">AI 评估方式</dt>
                <dd className="font-semibold">
                  {aiGraders.length ? aiGraders.join(" / ") : "未调用"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-[var(--amber)] bg-[#fffaf0] p-5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#6f551a]">
              <Info className="size-4" />
              演示评价
            </div>
            <Badge tone="amber" className="mt-3">
              非 AI 评分
            </Badge>
            <p className="mt-3 text-xs leading-6 text-[#735f31]">
              {scenario
                ? text(scenario.feedbackPlaceholder, "zh")
                : "本报告仅展示操作事实。"}
            </p>
          </section>
        </div>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-extrabold">
              <ListChecks className="size-4 text-[var(--green-700)]" />
              已完成操作与关键事件
            </h2>
            <span className="text-[10px] text-[var(--muted)]">
              按时间顺序
            </span>
          </div>
          <div className="mt-5 space-y-0">
            {state.events.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full",
                      event.tone === "error"
                        ? "bg-red-50 text-[var(--danger)]"
                        : event.tone === "success"
                          ? "bg-[var(--green-100)] text-[var(--green-800)]"
                          : "bg-[#edf0e9] text-[var(--muted)]",
                    )}
                  >
                    {event.tone === "error" ? (
                      <ShieldCheck className="size-3.5" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                  </span>
                  {index < state.events.length - 1 ? (
                    <span className="my-1 h-6 w-px bg-[var(--line)]" />
                  ) : null}
                </div>
                <div className="pb-3 pt-1">
                  <p className="text-xs font-semibold">{event.label}</p>
                  <p className="mt-1 text-[9px] text-[var(--muted)]">
                    {new Date(event.at).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {state.release.status === "released" ? (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[var(--green-100)] bg-[var(--green-50)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white text-[var(--green-800)]">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold">演示流程已完成</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                报告记录的是模拟状态，不代表真实部署或正式认证。
              </p>
            </div>
          </div>
          <Link
            href={`/workspace/${record.courseId}/${record.moduleId}/${record.scenarioId}`}
            className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--green-800)] px-4 text-xs font-bold text-white"
          >
            <FileBarChart2 className="size-3.5" />
            返回工作台
          </Link>
        </div>
      ) : null}
    </div>
  );
}
