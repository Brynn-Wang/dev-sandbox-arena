"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileBarChart2,
  ListChecks,
  Play,
  RotateCw,
} from "lucide-react";
import {
  DEFAULT_WORKSPACE_HREF,
  findPublicCourse,
  findPublicModule,
  findPublicScenario,
  workspaceHref,
  type PublicCourse,
} from "@/content/public-catalog";
import { text } from "@/content/ui";
import { phaseLabels } from "@/lib/simulation/selectors";
import { useRunRecords } from "@/lib/simulation/use-run-records";
import { Badge, EmptyState } from "./ui";

export function LearningRecords({ courses }: { courses: PublicCourse[] }) {
  const records = useRunRecords();

  if (records.length === 0) {
    return (
      <EmptyState
        title="还没有学习记录"
        description="开始演示后，运行开始时间、当前阶段、完成状态和操作次数会自动保存到当前浏览器。"
        action={
          <Link
            href={DEFAULT_WORKSPACE_HREF}
            className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--green-800)] px-4 text-sm font-bold text-white"
          >
            <Play className="size-4 fill-current" />
            开始演示
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const scenario = findPublicScenario(
          courses,
          record.courseId,
          record.moduleId,
          record.scenarioId,
        );
        const course = findPublicCourse(courses, record.courseId);
        const learningModule = findPublicModule(
          courses,
          record.courseId,
          record.moduleId,
        );
        const workspace =
          course && learningModule && scenario
            ? workspaceHref(course, learningModule, scenario)
            : `/workspace/${record.courseId}/${record.moduleId}/${record.scenarioId}`;

        return (
          <article
            key={record.runId}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:border-[var(--green-700)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                    record.status === "completed"
                      ? "bg-[var(--green-100)] text-[var(--green-800)]"
                      : "bg-[#fbf0d0] text-[#7a5c18]"
                  }`}
                >
                  {record.status === "completed" ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <RotateCw className="size-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-extrabold">
                      {scenario ? text(scenario.title, "zh") : "未知学习任务"}
                    </h2>
                    <Badge tone={record.status === "completed" ? "green" : "amber"}>
                      {record.status === "completed" ? "已完成" : "进行中"}
                    </Badge>
                    <Badge tone="neutral">
                      {record.source === "remote" ? "CONNECTED" : "DEMO"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {course ? text(course.title, "zh") : record.courseId} ·{" "}
                    {learningModule
                      ? text(learningModule.title, "zh")
                      : record.moduleId}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="size-3.5" />
                      开始于{" "}
                      {new Date(record.startedAt).toLocaleString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5" />
                      {text(phaseLabels[record.phase], "zh")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ListChecks className="size-3.5" />
                      {record.eventCount} 项操作
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={workspace}
                  className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 text-xs font-bold text-[var(--ink)] hover:bg-[var(--green-50)]"
                >
                  {record.status === "completed" ? "查看工作台" : "继续学习"}
                  <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href={`/records/${record.runId}`}
                  className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--green-800)] px-4 text-xs font-bold text-white"
                >
                  <FileBarChart2 className="size-3.5" />
                  查看报告
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
