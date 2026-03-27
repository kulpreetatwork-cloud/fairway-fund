import { ReactNode } from "react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.35em] text-coral">{eyebrow}</p>
      <h2 className="max-w-3xl font-display text-4xl leading-tight text-white sm:text-5xl">
        {title}
      </h2>
      <p className="max-w-2xl text-base leading-8 text-white/72">{description}</p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-soft">
      <p className="text-xs uppercase tracking-[0.35em] text-white/45">{label}</p>
      <p className="mt-4 font-display text-4xl text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/65">{helper}</p>
    </div>
  );
}

export function Surface({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/10 bg-panel p-6 shadow-soft sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: "bg-white/10 text-white/75",
    success: "bg-emerald-500/20 text-emerald-200",
    warning: "bg-amber-500/20 text-amber-100",
    danger: "bg-rose-500/20 text-rose-100",
  };

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

export function MoneyLine({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-3 text-sm text-white/75 last:border-b-0">
      <span>{label}</span>
      <span className="font-semibold text-white">{formatCurrency(amount)}</span>
    </div>
  );
}

export function ScorePill({ score }: { score: number }) {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-ink">
      {score}
    </span>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
      <p className="font-display text-2xl text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-white/65">{body}</p>
    </div>
  );
}

export function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-3 text-sm last:border-b-0">
      <span className="text-white/55">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

export function DrawNumberStrip({ numbers }: { numbers: number[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {numbers.map((number, index) => {
        return (
          <span
            key={`${number}-${index}`}
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-coral/25 bg-coral/15 text-lg font-semibold text-coral-light"
          >
            {number}
          </span>
        );
      })}
    </div>
  );
}

export function LabelValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-white/42">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white/78">{value}</p>
    </div>
  );
}

export function DateValue({ date }: { date: string }) {
  return <span>{formatDate(date)}</span>;
}

export function SectionGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 lg:grid-cols-2">{children}</div>;
}
