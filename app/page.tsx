import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Boxes,
  CheckCircle2,
  CircleDot,
  GitPullRequest,
  Mail,
  Play,
  Sparkles,
  TestTube2,
} from "lucide-react";
import { courses, demoWorkspaceHref } from "@/content/courses";
import { Badge, Card } from "@/components/ui";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const flow = [
  { label: "读取任务", icon: Mail },
  { label: "整理需求", icon: BookOpenCheck },
  { label: "AI 修改", icon: Sparkles },
  { label: "测试验证", icon: TestTube2 },
  { label: "审查发布", icon: GitPullRequest },
];

export default function Home() {
  const moduleCount = courses.reduce(
    (total, course) => total + course.modules.length,
    0,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-[var(--line)]">
          <div className="grid-paper absolute inset-0 opacity-55" />
          <div className="absolute -right-24 top-16 size-80 rounded-full bg-[#dfeeb5]/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-18 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-24">
            <div className="animate-enter">
              <Badge tone="lime" className="mb-6">
                <CircleDot className="size-3" />
                DEMO-FIRST LEARNING WORKSPACE
              </Badge>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                把软件开发流程，
                <span className="block text-[var(--green-700)]">
                  练成可验证的操作。
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                在一个连贯的模拟项目中读取邮件、澄清需求、与 AI
                协作、检查差异、运行测试并发布。每一步都改变状态，也都有真实的前置条件。
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/courses"
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--green-900)] px-6 text-sm font-bold text-white transition hover:bg-[var(--green-950)]"
                >
                  进入课程
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={demoWorkspaceHref}
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-6 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--green-700)] hover:bg-[var(--green-50)]"
                >
                  <Play className="size-4 fill-current" />
                  体验演示
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-[var(--muted)]">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[var(--green-700)]" />
                  无需密钥
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[var(--green-700)]" />
                  本地保存进度
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[var(--green-700)]" />
                  操作记录可追溯
                </span>
              </div>
            </div>

            <div className="animate-enter [animation-delay:120ms]">
              <Card className="soft-shadow relative overflow-hidden border-[color:rgba(24,83,63,0.16)] bg-white p-5">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--green-700)]">
                      ACTIVE DEMO
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold">
                      从缺陷说明到正式发布
                    </h2>
                  </div>
                  <span className="rounded-full bg-[var(--green-50)] px-3 py-1 text-[11px] font-bold text-[var(--green-800)]">
                    15 MIN
                  </span>
                </div>
                <div className="mt-5 space-y-2">
                  {flow.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[#fbfcf8] px-3.5 py-3"
                      >
                        <span className="grid size-8 place-items-center rounded-lg bg-[var(--green-100)] text-[var(--green-800)]">
                          <Icon className="size-4" />
                        </span>
                        <span className="flex-1 text-sm font-semibold">
                          {item.label}
                        </span>
                        <span className="font-mono text-[10px] text-[#9aab9e]">
                          0{index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href={demoWorkspaceHref}
                  className="focus-ring mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--lime)] text-sm font-black text-[var(--green-950)] transition hover:bg-[#cfe96d]"
                >
                  打开示例工作台
                  <ArrowRight className="size-4" />
                </Link>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Boxes,
                kicker: "SHARED TOOLS",
                title: "一套组件，多种任务",
                body: "任务、邮件、文件、助手、测试、版本、发布和摘要共用同一套工作台。",
              },
              {
                icon: Sparkles,
                kicker: "VISIBLE BOUNDARY",
                title: "Demo 与真实模式分开",
                body: "本地演示明确标注模拟数据；服务端模型和 Supabase 通过清晰边界后续接入。",
              },
              {
                icon: GitPullRequest,
                kicker: "STATE-GUARDED",
                title: "结果来自真实状态",
                body: "未通过测试不能提交，未批准 PR 不能发布，重新开始会生成独立运行。",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="p-6 transition hover:border-[var(--green-700)]"
                >
                  <Icon className="size-6 text-[var(--green-700)]" />
                  <p className="mt-7 text-[10px] font-black tracking-[0.16em] text-[var(--green-700)]">
                    {feature.kicker}
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold tracking-[-0.025em]">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {feature.body}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 grid gap-8 rounded-[2rem] bg-[var(--green-950)] p-7 text-white sm:p-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div>
              <Badge tone="lime">FRAMEWORK READY</Badge>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">
                {moduleCount} 个模块入口
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#c9d8ce]">
                首个流程可完整操作，其余实验通过配置展示入口、工具范围与后续扩展点。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {courses.flatMap((course) =>
                course.modules.map((module) => (
                  <Link
                    key={module.id}
                    href="/courses"
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                  >
                    <span>{module.title.zh}</span>
                    <span className="text-[10px] text-[#9fb4a7]">
                      {module.readiness === "ready" ? "READY" : "SLOT"}
                    </span>
                  </Link>
                )),
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
