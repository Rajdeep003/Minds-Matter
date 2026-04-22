import { LoaderCircle } from "lucide-react";
import { cn } from "../../utils/cn";

export function Button({ className, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700",
    secondary: "bg-slate-900/5 text-slate-900 hover:bg-slate-900/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
    ghost: "text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 dark:border-white/10 dark:bg-slate-950 dark:text-white",
        className
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 dark:border-white/10 dark:bg-slate-950 dark:text-white",
        className
      )}
      {...props}
    />
  );
}

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-200",
        className
      )}
      {...props}
    />
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">{eyebrow}</p> : null}
        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <Card className="space-y-2">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </Card>
  );
}

export function EmptyState({ title, description }) {
  return (
    <Card className="border-dashed text-center">
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </Card>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10", className)} />;
}

export function LoadingView() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  );
}
