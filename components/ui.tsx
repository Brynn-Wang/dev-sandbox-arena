import type { ComponentPropsWithoutRef, ReactNode } from "react";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" &&
          "bg-[var(--green-800)] text-white hover:bg-[var(--green-900)]",
        variant === "secondary" &&
          "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--green-700)] hover:bg-[var(--green-50)]",
        variant === "ghost" &&
          "text-[var(--green-800)] hover:bg-[var(--green-100)]",
        variant === "danger" &&
          "border border-red-200 bg-red-50 text-[var(--danger)] hover:bg-red-100",
        size === "sm" && "min-h-9 px-3 text-xs",
        size === "md" && "min-h-10 px-4 text-sm",
        size === "lg" && "min-h-12 px-5 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "green",
  className,
}: {
  children: ReactNode;
  tone?: "green" | "lime" | "amber" | "neutral" | "red";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
        tone === "green" && "bg-[var(--green-100)] text-[var(--green-800)]",
        tone === "lime" && "bg-[#eef7bd] text-[#526213]",
        tone === "amber" && "bg-[#fbf0d0] text-[#7a5c18]",
        tone === "neutral" && "bg-[#edf0e9] text-[var(--muted)]",
        tone === "red" && "bg-red-50 text-[var(--danger)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.max(0, Math.min(100, value))}
      className={cn(
        "h-1.5 overflow-hidden rounded-full bg-[#e4eadf]",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[var(--green-700)] transition-[width] duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.4rem] border border-[var(--line)] bg-[var(--panel)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 p-8 text-center">
      <p className="font-bold text-[var(--ink)]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
