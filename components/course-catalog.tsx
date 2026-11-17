"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  FlaskConical,
  Layers3,
} from "lucide-react";
import { useMemo } from "react";
import {
  workspaceHref,
  type PublicCourse,
} from "@/content/public-catalog";
import { text, uiCopy } from "@/content/ui";
import { usePreferencesSnapshot } from "@/lib/use-preferences";
import { useRunRecords } from "@/lib/simulation/use-run-records";
import { Badge, Card, ProgressBar } from "./ui";

export function CourseCatalog({ courses }: { courses: PublicCourse[] }) {
  const records = useRunRecords();
  const locale = usePreferencesSnapshot().language;

  const activeByScenario = useMemo(
    () =>
      Object.fromEntries(
        records
          .slice()
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .map((record) => [record.scenarioId, record]),
      ),
    [records],
  );
  const copy = uiCopy[locale];

  return (
    <div className="space-y-12">
      {courses.map((course, courseIndex) => (
        <section key={course.id}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                  course.accent === "mint"
                    ? "bg-[var(--green-100)] text-[var(--green-800)]"
                    : "bg-[#eef7bd] text-[#5a6817]"
                }`}
              >
                <BookOpen className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black tracking-[-0.025em]">
                    {text(course.title, locale)}
                  </h2>
                  <Badge tone="neutral">
                    {courseIndex === 0 ? "CORE" : "PROJECT"}
                  </Badge>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {text(course.description, locale)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
              <Layers3 className="size-4" />
              {course.modules.length} modules
              <span className="text-[#b9c4bb]">/</span>
              {text(course.level, locale)}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {course.modules.map((module) => {
              const scenario = module.scenarios[0];
              const record = activeByScenario[scenario.id];
              const progress =
                record?.phase === "complete"
                  ? 100
                  : record
                    ? Math.min(
                        80,
                        Math.max(8, Math.round(record.eventCount * 7.5)),
                      )
                    : 0;
              const statusKey =
                record?.status === "completed"
                  ? "completed"
                  : record
                    ? "inProgress"
                    : "notStarted";
              const href = workspaceHref(course, module, scenario);

              return (
                <Card
                  key={module.id}
                  className="group flex min-h-72 flex-col overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--green-700)] hover:shadow-[0_16px_35px_rgba(24,83,63,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <span className="mt-0.5 grid size-9 place-items-center rounded-xl bg-[var(--green-50)] text-[var(--green-800)]">
                        {module.readiness === "ready" ? (
                          <FlaskConical className="size-4" />
                        ) : (
                          <Layers3 className="size-4" />
                        )}
                      </span>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--green-700)]">
                          {text(module.stage, locale)}
                        </p>
                        <h3 className="mt-1 text-lg font-extrabold leading-6 tracking-[-0.02em]">
                          {text(module.title, locale)}
                        </h3>
                      </div>
                    </div>
                    <Badge
                      tone={
                        statusKey === "completed"
                          ? "green"
                          : statusKey === "inProgress"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {copy.common[statusKey]}
                    </Badge>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
                    {text(module.summary, locale)}
                  </p>

                  <div className="mt-auto pt-6">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5" />
                        {module.estimatedMinutes} {copy.common.minutes}
                      </span>
                      <span>
                        {progress}% {copy.common.inProgress}
                      </span>
                    </div>
                    <ProgressBar value={progress} />
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span className="text-xs text-[var(--muted)]">
                        {module.readiness === "ready"
                          ? `${scenario.enabledTools.length} shared tools`
                          : copy.common.placeholder}
                      </span>
                      <Link
                        href={href}
                        className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-[var(--green-800)] hover:text-[var(--green-950)]"
                      >
                        {statusKey === "inProgress"
                          ? copy.common.continue
                          : statusKey === "completed"
                            ? "查看"
                            : copy.common.start}
                        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
