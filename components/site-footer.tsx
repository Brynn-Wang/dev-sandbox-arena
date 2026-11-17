import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[#f0f3ea]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>
          <span className="font-bold text-[var(--ink)]">Itera Studio</span> ·
          用可验证操作理解软件开发
        </p>
        <div className="flex gap-5">
          <Link className="hover:text-[var(--ink)]" href="/admin/content">
            课程配置
          </Link>
          <Link className="hover:text-[var(--ink)]" href="/settings">
            数据与设置
          </Link>
          <span>Demo v0.1</span>
        </div>
      </div>
    </footer>
  );
}
