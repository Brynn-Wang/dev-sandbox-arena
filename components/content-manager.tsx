"use client";

import {
  Braces,
  CheckCircle2,
  ChevronRight,
  Code2,
  FolderTree,
  LockKeyhole,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Course } from "@/content/types";
import { CourseConfigSchema } from "@/content/types";
import { toolLabels } from "@/content/ui";
import { Badge, cn } from "./ui";

export function ContentManager({ courses }: { courses: Course[] }) {
  const [courseId, setCourseId] = useState(courses[0].id);
  const [moduleId, setModuleId] = useState(courses[0].modules[0].id);
  const course = courses.find((item) => item.id === courseId) ?? courses[0];
  const selectedModule =
    course.modules.find((item) => item.id === moduleId) ?? course.modules[0];
  const scenario = selectedModule.scenarios[0];
  const validation = CourseConfigSchema.safeParse(courses);

  return (
    <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)_17rem]">
      <aside className="rounded-2xl border border-[var(--line)] bg-white p-3">
        <p className="px-2 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
          COURSE CONFIG
        </p>
        {courses.map((item) => (
          <div key={item.id} className="mb-2">
            <button
              type="button"
              onClick={() => {
                setCourseId(item.id);
                setModuleId(item.modules[0].id);
              }}
              className={cn(
                "focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold",
                course.id === item.id
                  ? "bg-[var(--green-100)] text-[var(--green-900)]"
                  : "text-[var(--ink)] hover:bg-[var(--green-50)]",
              )}
            >
              <FolderTree className="size-3.5" />
              {item.title.zh}
            </button>
            {course.id === item.id ? (
              <div className="ml-4 mt-1 border-l border-[var(--line)] pl-2">
                {item.modules.map((moduleItem) => (
                  <button
                    key={moduleItem.id}
                    type="button"
                    onClick={() => setModuleId(moduleItem.id)}
                    className={cn(
                      "focus-ring flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-[11px]",
                      selectedModule.id === moduleItem.id
                        ? "bg-[#f3f6ee] font-bold text-[var(--green-900)]"
                        : "text-[var(--muted)] hover:bg-[#f8faf5]",
                    )}
                  >
                    {moduleItem.title.zh}
                    <ChevronRight className="size-3" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </aside>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--green-700)]">
              MODULE PREVIEW
            </p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.025em]">
              {selectedModule.title.zh}
            </h2>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              {selectedModule.summary.zh}
            </p>
          </div>
          <Badge
            tone={selectedModule.readiness === "ready" ? "green" : "amber"}
          >
            {selectedModule.readiness === "ready" ? "READY" : "PLACEHOLDER"}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
              模块名称
            </span>
            <input
              readOnly
              value={selectedModule.title.zh}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#fbfcf8] px-3 py-2.5 text-xs"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
              阶段
            </span>
            <input
              readOnly
              value={selectedModule.stage.zh}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#fbfcf8] px-3 py-2.5 text-xs"
            />
          </label>
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
            启用工具
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {scenario.enabledTools.map((tool) => (
              <Badge key={tool} tone="neutral">
                {toolLabels[tool].zh}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--line)] bg-[#15231e] p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#a8bdb0]">
            <Braces className="size-3.5" />
            配置摘要
          </div>
          <pre className="thin-scrollbar mt-3 max-h-64 overflow-auto whitespace-pre-wrap font-mono text-[10px] leading-5 text-[#c7d9cc]">
            {JSON.stringify(
              {
                course: course.slug,
                module: selectedModule.slug,
                scenario: scenario.id,
                enabledTools: scenario.enabledTools,
                taskSteps: scenario.taskSteps.map((step) => step.id),
                files: scenario.initialFiles.map((file) => file.path),
                messages: scenario.messages.length,
                completionConditions: scenario.completionConditions.map(
                  (condition) => condition.id,
                ),
              },
              null,
              2,
            )}
          </pre>
        </div>
        <p className="mt-3 text-[10px] leading-5 text-[var(--muted)]">
          当前页面为只读预览。首版不会从浏览器直接改写源配置文件，以免覆盖部署中的课程内容。
        </p>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-[var(--green-100)] bg-[var(--green-50)] p-5">
          <CheckCircle2 className="size-5 text-[var(--green-700)]" />
          <h2 className="mt-3 text-sm font-extrabold">Zod 校验</h2>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            {validation.success
              ? `${courses.length} 门课程、${courses.reduce(
                  (total, item) => total + item.modules.length,
                  0,
                )} 个模块通过 CourseConfigSchema。`
              : "课程配置存在校验错误。"}
          </p>
        </div>
        {[
          {
            icon: Code2,
            title: "新增课程",
            body: "优先新增 content/courses.ts 中的配置，不修改工具页面。",
          },
          {
            icon: Users,
            title: "班级与教师权限",
            body: "后续接入 Supabase Auth、组织成员和教师角色。",
          },
          {
            icon: LockKeyhole,
            title: "答案与评分",
            body: "正式答案和评分规则应留在服务端，不发送到浏览器。",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-[var(--line)] bg-white p-4"
            >
              <Icon className="size-4 text-[var(--green-700)]" />
              <p className="mt-3 text-xs font-extrabold">{item.title}</p>
              <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
                {item.body}
              </p>
              <Badge tone="neutral" className="mt-3">
                EXTENSION SLOT
              </Badge>
            </div>
          );
        })}
      </aside>
    </div>
  );
}
