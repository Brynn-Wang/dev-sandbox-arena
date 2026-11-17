"use client";

import {
  Check,
  Languages,
  LockKeyhole,
  MonitorCog,
  Save,
  ServerCog,
} from "lucide-react";
import { useState } from "react";
import {
  savePreferences,
  type Preferences,
} from "@/lib/preferences";
import { usePreferencesSnapshot } from "@/lib/use-preferences";
import { Badge, Button, cn } from "./ui";

export function SettingsForm({ connectedMode }: { connectedMode: boolean }) {
  const storedPreferences = usePreferencesSnapshot();
  const [draft, setDraft] = useState<Preferences | null>(null);
  const [saved, setSaved] = useState(false);
  const preferences = draft ?? storedPreferences;

  function update<Key extends keyof Preferences>(
    key: Key,
    value: Preferences[Key],
  ) {
    setDraft((current) => ({ ...(current ?? storedPreferences), [key]: value }));
    setSaved(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_19rem]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--green-50)] text-[var(--green-800)]">
              <Languages className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold">界面语言</h2>
              <p className="text-xs text-[var(--muted)]">
                主导航会立即切换；详细工具文案保留中文课堂默认。
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {([
              ["zh", "中文", "课堂默认界面"],
              ["en", "English", "Navigation-first localization"],
            ] as const).map(([value, title, description]) => (
              <button
                key={value}
                type="button"
                onClick={() => update("language", value)}
                className={cn(
                  "focus-ring rounded-xl border p-4 text-left transition",
                  preferences.language === value
                    ? "border-[var(--green-700)] bg-[var(--green-50)]"
                    : "border-[var(--line)] hover:border-[var(--green-700)]",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold">{title}</p>
                  {preferences.language === value ? (
                    <Check className="size-4 text-[var(--green-700)]" />
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--green-50)] text-[var(--green-800)]">
              <MonitorCog className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold">视觉主题</h2>
              <p className="text-xs text-[var(--muted)]">
                首版保持浅色、深绿色点缀。
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {([
              ["light", "浅色留白", "明亮画布与清晰边界"],
              ["focus", "深绿聚焦", "略深的绿色画布"],
            ] as const).map(([value, title, description]) => (
              <button
                key={value}
                type="button"
                onClick={() => update("theme", value)}
                className={cn(
                  "focus-ring rounded-xl border p-4 text-left",
                  preferences.theme === value
                    ? "border-[var(--green-700)] bg-[var(--green-50)]"
                    : "border-[var(--line)]",
                )}
              >
                <div
                  className={cn(
                    "mb-3 h-14 rounded-lg border border-black/5",
                    value === "light" ? "bg-[#f4f6ef]" : "bg-[#dce7d9]",
                  )}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold">{title}</p>
                  {preferences.theme === value ? (
                    <Check className="size-4 text-[var(--green-700)]" />
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--green-50)] text-[var(--green-800)]">
              <ServerCog className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold">摘要自定义指令</h2>
              <p className="text-xs text-[var(--muted)]">
                为后续服务端摘要任务预留，Demo 不会调用模型。
              </p>
            </div>
          </div>
          <textarea
            value={preferences.summaryInstruction}
            onChange={(event) =>
              update("summaryInstruction", event.target.value)
            }
            className="focus-ring mt-5 min-h-36 w-full rounded-xl border border-[var(--line)] bg-[#fbfcf8] p-4 text-sm leading-6"
            placeholder="例如：先给出三条要点，再列出风险与行动项。"
          />
        </section>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">
            {saved ? "设置已保存到当前浏览器。" : "修改尚未保存。"}
          </p>
          <Button
            onClick={() => {
              savePreferences(preferences);
              setDraft(null);
              setSaved(true);
            }}
          >
            <Save className="size-4" />
            保存设置
          </Button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-[var(--green-950)] p-5 text-white">
          <Badge tone="lime">
            {connectedMode ? "CONNECTED" : "DEMO DEFAULT"}
          </Badge>
          <h2 className="mt-4 text-lg font-extrabold">数据模式</h2>
          <p className="mt-2 text-xs leading-6 text-[#c7d8cd]">
            {connectedMode
              ? "当前运行由服务端保存，学生只能读取自己的记录，写入通过受保护 API 完成。"
              : "当前学习状态保存在 localStorage。无需账号、密钥或外部服务。"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <LockKeyhole className="size-5 text-[var(--green-700)]" />
          <h2 className="mt-3 text-sm font-extrabold">Connected 模式</h2>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            {connectedMode
              ? "Supabase Auth、RLS、服务端运行与事件记录已启用；模型失败会降级到关键词评估。"
              : "Connected 模式已具备代码和迁移入口，但当前环境仍以 Demo 模式运行。"}
          </p>
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold text-[var(--danger)]">
            正式发布前仍需在 Staging Supabase 项目验证 RLS、OAuth 回调与迁移顺序。
          </p>
        </div>
      </aside>
    </div>
  );
}
