import type { Metadata } from "next";
import { History, Info } from "lucide-react";
import { LearningRecords } from "@/components/learning-records";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui";
import { publicCourses } from "@/content/server-catalog";

export const metadata: Metadata = {
  title: "学习记录",
};

export default function RecordsPage() {
  const connectedMode = process.env.RUN_MODE === "connected";
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
        <Badge tone="green">
          <History className="size-3" />
          {connectedMode ? "CONNECTED RUNS" : "LOCAL RUNS"}
        </Badge>
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-[-0.045em]">学习记录</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              每次开始或重新演示都会生成独立的运行 ID。运行来源会明确标记为
              DEMO 或 CONNECTED。
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--amber)] bg-[#fffaf0] px-3 py-2 text-[11px] text-[#73581b]">
            <Info className="size-4 shrink-0" />
            {connectedMode ? "已登录账号可跨设备恢复" : "仅保存在当前浏览器"}
          </div>
        </div>
        <div className="mt-9">
          <LearningRecords courses={publicCourses} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
