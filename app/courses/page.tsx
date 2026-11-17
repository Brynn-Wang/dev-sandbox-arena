import type { Metadata } from "next";
import { BookOpen, LayoutGrid } from "lucide-react";
import { CourseCatalog } from "@/components/course-catalog";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui";
import { publicCourses as courses } from "@/content/server-catalog";

export const metadata: Metadata = {
  title: "课程与项目",
};

export default function CoursesPage() {
  const readyModules = courses.reduce(
    (total, course) =>
      total +
      course.modules.filter((module) => module.readiness === "ready").length,
    0,
  );
  const moduleCount = courses.reduce(
    (total, course) => total + course.modules.length,
    0,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
        <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Badge tone="green">
              <LayoutGrid className="size-3" />
              COURSE MAP
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.045em] sm:text-5xl">
              从一次缺陷修复，走向完整项目。
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              课程以模块和阶段组织，共享同一套工作台工具。配置占位模块已经可导航，正式内容接入时主要新增配置。
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4">
              <p className="text-2xl font-black">{moduleCount}</p>
              <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                模块入口
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4">
              <p className="text-2xl font-black">{readyModules}</p>
              <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                可运行模块
              </p>
            </div>
          </div>
        </div>

        <div className="mb-7 flex items-center gap-3 rounded-2xl border border-[var(--green-100)] bg-[var(--green-50)] px-4 py-3 text-sm text-[var(--green-900)]">
          <BookOpen className="size-5 shrink-0" />
          <p>
            “可运行”表示入口和交互已经接通；“配置占位”表示共享组件已预留，题目、文件、测试和评分仍待配置。
          </p>
        </div>
        <CourseCatalog courses={courses} />
      </main>
      <SiteFooter />
    </div>
  );
}
