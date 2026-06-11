import type { ReactNode } from "react";

export const COLORS = {
  bg: "#f8fafc",
  panel: "#ffffff",
  indigo: "#6366f1",
  green: "#10b981",
  teal: "#14b8a6",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
  violet: "#8b5cf6",
};

export function GlassPanel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            {title && (
              <h3
                className="text-[15px] font-semibold text-slate-900"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-[12px] text-slate-500">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

export function KpiCard({
  title,
  value,
  trend,
  trendDirection = "up",
  icon,
  footer,
  accent = COLORS.teal,
}: {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: ReactNode;
  footer?: string;
  accent?: string;
}) {
  const trendColor =
    trendDirection === "up"
      ? COLORS.green
      : trendDirection === "down"
        ? COLORS.red
        : "#64748b";
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-5 overflow-hidden shadow-sm">
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
            {title}
          </div>
          <div
            className="mt-2 text-2xl font-semibold text-slate-900"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            {value}
          </div>
          {trend && (
            <div
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md"
              style={{ color: trendColor, backgroundColor: `${trendColor}15` }}
            >
              {trend}
            </div>
          )}
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          {icon}
        </div>
      </div>
      {footer && <div className="mt-3 text-[11px] text-slate-500 relative">{footer}</div>}
    </div>
  );
}

export function Pill({
  label,
  tone = "indigo",
}: {
  label: string;
  tone?: "indigo" | "green" | "teal" | "amber" | "red" | "slate" | "blue" | "violet";
}) {
  const map = {
    indigo: { fg: "#4338ca", bg: "#eef2ff" },
    green: { fg: "#047857", bg: "#ecfdf5" },
    teal: { fg: "#0f766e", bg: "#f0fdfa" },
    amber: { fg: "#b45309", bg: "#fffbeb" },
    red: { fg: "#b91c1c", bg: "#fef2f2" },
    slate: { fg: "#475569", bg: "#f1f5f9" },
    blue: { fg: "#1d4ed8", bg: "#eff6ff" },
    violet: { fg: "#6d28d9", bg: "#f5f3ff" },
  }[tone];
  return (
    <span
      className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ color: map.fg, backgroundColor: map.bg }}
    >
      {label}
    </span>
  );
}
