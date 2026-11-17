"use client";

import Link from "next/link";
import { GitBranch, LoaderCircle, Mail } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui";
import {
  getBrowserSupabase,
  isBrowserAuthConfigured,
} from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const configured = isBrowserAuthConfigured();

  async function signInWithGithub() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setPending(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
    setPending(false);
  }

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setPending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setPending(false);
    setMessage(
      error ? error.message : "登录链接已发送，请检查邮箱并完成验证。",
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--canvas)] px-5 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-white p-7 shadow-[0_24px_80px_rgba(17,61,47,0.12)] sm:p-9">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--green-900)] text-sm font-black text-lime-200">
            I.
          </span>
          <span>
            <span className="block text-sm font-black">Itera Studio</span>
            <span className="text-[10px] tracking-[0.13em] text-[var(--muted)]">
              CONNECTED LEARNING
            </span>
          </span>
        </Link>

        <Badge tone="green" className="mt-8">
          Connected mode
        </Badge>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">
          登录并同步学习进度
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          登录后，服务端会保存当前运行、事件记录和 AI 评估方式。Demo
          模式仍然无需账号。
        </p>

        {!configured ? (
          <div className="mt-6 rounded-xl border border-[var(--amber)] bg-[#fffaf0] p-4 text-xs leading-5 text-[#73581b]">
            Supabase 尚未配置。请使用 `.env.local` 或 Vercel
            环境变量填写项目 URL 和 anon key。
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={signInWithGithub}
              disabled={pending}
              className="focus-ring mt-7 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--green-900)] text-sm font-bold text-white disabled:opacity-60"
            >
              <GitBranch className="size-4" />
              使用 GitHub 登录
            </button>

            <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <span className="h-px flex-1 bg-[var(--line)]" />
              或
              <span className="h-px flex-1 bg-[var(--line)]" />
            </div>

            <form onSubmit={sendMagicLink} className="space-y-3">
              <label htmlFor="email" className="text-xs font-bold">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="focus-ring min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm"
              />
              <button
                type="submit"
                disabled={pending}
                className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white text-sm font-bold disabled:opacity-60"
              >
                {pending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )}
                发送登录链接
              </button>
            </form>
          </>
        )}

        {message ? (
          <p className="mt-4 rounded-xl bg-[var(--green-50)] p-3 text-xs leading-5 text-[var(--green-800)]">
            {message}
          </p>
        ) : null}

        <Link
          href="/courses"
          className="mt-6 block text-center text-xs font-bold text-[var(--green-800)]"
        >
          继续使用免登录 Demo
        </Link>
      </section>
    </main>
  );
}
