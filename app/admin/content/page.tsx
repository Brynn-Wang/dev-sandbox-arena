import type { Metadata } from "next";
import { Database, Settings2 } from "lucide-react";
import { ContentManager } from "@/components/content-manager";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui";
import { courses } from "@/content/courses";

export const metadata: Metadata = {
  title: "内容配置",
};

export default function ContentAdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
        <Badge tone="green">
          <Settings2 className="size-3" />
          CONTENT CONFIG
        </Badge>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-[-0.045em]">
              课程配置入口
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              检查模块、启用工具、任务步骤、文件、消息和完成条件。完整班级管理、排行榜和教师权限仅保留扩展位。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <Database className="size-4" />
            源配置 + Zod Schema
          </div>
        </div>
        <div className="mt-9">
          <ContentManager courses={courses} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
