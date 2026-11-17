"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, UserRound, X } from "lucide-react";
import { Suspense, useState } from "react";
import { DEFAULT_WORKSPACE_HREF } from "@/content/public-catalog";
import { uiCopy } from "@/content/ui";
import { usePreferencesSnapshot } from "@/lib/use-preferences";
import { cn } from "./ui";

const navItems = [
  { key: "home", href: "/" },
  { key: "courses", href: "/courses" },
  { key: "records", href: "/records" },
  { key: "content", href: "/admin/content" },
  { key: "settings", href: "/settings" },
] as const;

export function SiteHeader() {
  const preferences = usePreferencesSnapshot();
  const [mobileOpen, setMobileOpen] = useState(false);
  const locale = preferences.language;
  const copy = uiCopy[locale];

  return (
    <header className="relative z-50 border-b border-[color:rgba(23,52,42,0.08)] bg-[color:rgba(249,250,245,0.86)] backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-5 px-5 lg:px-8">
        <Link
          href="/"
          className="focus-ring flex items-center gap-3 rounded-xl"
          aria-label="Itera Studio home"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--green-900)] text-sm font-black text-lime-200">
            I.
          </span>
          <span>
            <span className="block text-sm font-black tracking-[-0.02em]">
              Itera Studio
            </span>
            <span className="block text-[10px] font-medium tracking-[0.14em] text-[var(--muted)]">
              LEARN BY SHIPPING
            </span>
          </span>
        </Link>

        <Suspense
          fallback={
            <div className="hidden h-9 w-96 animate-pulse rounded-lg bg-[#e7eee2] lg:block" />
          }
        >
          <DesktopNavigation copy={copy} />
        </Suspense>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="focus-ring hidden min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-[var(--muted)] hover:bg-white hover:text-[var(--ink)] lg:inline-flex"
          >
            <UserRound className="size-3.5" />
            {locale === "zh" ? "登录" : "Sign in"}
          </Link>
          <Link
            href={DEFAULT_WORKSPACE_HREF}
            className="focus-ring hidden min-h-10 items-center gap-2 rounded-xl bg-[var(--green-900)] px-4 text-xs font-bold text-white transition hover:bg-[var(--green-950)] sm:inline-flex"
          >
            {copy.nav.openWorkspace}
            <ArrowUpRight className="size-4" />
          </Link>
          <button
            type="button"
            className="focus-ring grid size-10 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          className="border-t border-[var(--line)] bg-[var(--panel)] px-5 py-3 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="focus-ring rounded-xl px-3 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--green-50)]"
              >
                {copy.nav[item.key]}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function DesktopNavigation({
  copy,
}: {
  copy: (typeof uiCopy)["zh"] | (typeof uiCopy)["en"];
}) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
      {navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "focus-ring rounded-lg px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-[var(--green-100)] text-[var(--green-900)]"
                : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]",
            )}
          >
            {copy.nav[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}
