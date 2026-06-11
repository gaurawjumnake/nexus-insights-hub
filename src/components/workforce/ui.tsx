import type { ReactNode } from "react";

export const COLORS = {
  bg: "#060913",
  panel: "#0d1222",
  indigo: "#6366f1",
  green: "#10b981",
  teal: "#14b8a6",
  amber: "#f59e0b",
  red: "#ef4444",
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
      className={`rounded-2xl border border-white/5 backdrop-blur-sm ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(20,184,166,0.02) 100%), rgba(13,18,34,0.85)",
      }}
    >
      {(title || action) && (
        <header className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            {title && (
              <h3
                className="text-[15px] font-semibold text-white"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-[12px] text-slate-400">{description}</p>
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
  accent = COLORS.indigo,
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
        : "#94a3b8";
  return (
    <div
      className="relative rounded-2xl border border-white/5 p-5 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%), #0d1222",
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
            {title}
          </div>
          <div
            className="mt-2 text-2xl font-semibold text-white"
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
          style={{ backgroundColor: `${accent}1f`, color: accent }}
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
  tone?: "indigo" | "green" | "teal" | "amber" | "red" | "slate";
}) {
  const c = {
    indigo: COLORS.indigo,
    green: COLORS.green,
    teal: COLORS.teal,
    amber: COLORS.amber,
    red: COLORS.red,
    slate: "#94a3b8",
  }[tone];
  return (
    <span
      className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ color: c, backgroundColor: `${c}1a`, border: `1px solid ${c}33` }}
    >
      {label}
    </span>
  );
}
