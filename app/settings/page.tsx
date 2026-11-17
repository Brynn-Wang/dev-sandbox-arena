import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SettingsForm } from "@/components/settings-form";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "设置",
};

export default function SettingsPage() {
  const connectedMode = process.env.RUN_MODE === "connected";
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
        <Badge tone="green">
          <SlidersHorizontal className="size-3" />
          PREFERENCES
        </Badge>
        <h1 className="mt-5 text-4xl font-black tracking-[-0.045em]">设置</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          偏好保存在当前浏览器；学习运行是否跨设备同步由部署环境的数据模式决定。
        </p>
        <div className="mt-9">
          <SettingsForm connectedMode={connectedMode} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
