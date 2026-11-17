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
          首版偏好保存在当前浏览器。语言切换先覆盖主导航与设置界面；课程标题、描述保留双语字段，详细工具文案仍以中文课堂内容为主。
        </p>
        <div className="mt-9">
          <SettingsForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
