import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PreferencesBootstrap } from "@/components/preferences-bootstrap";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Itera Studio | AI 辅助软件开发学习平台",
    template: "%s | Itera Studio",
  },
  description:
    "在可验证的模拟项目中练习需求、AI 协作、测试、版本管理与发布。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full bg-[var(--canvas)] text-[var(--ink)]">
        <PreferencesBootstrap />
        {children}
      </body>
    </html>
  );
}
