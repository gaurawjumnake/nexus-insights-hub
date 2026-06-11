import type { ReactNode } from "react";

export function PagePlaceholder({
  title,
  company,
  children,
}: {
  title: string;
  company: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.18em] text-slate-500 mb-1">
          WORKSPACE · {company.toUpperCase()}
        </div>
        <h1
          className="text-2xl font-semibold text-slate-900"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          {title}
        </h1>
      </div>
      {children ?? (
        <div className="rounded-2xl p-10 border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
          This page is wired into the navigation. Content will be populated in upcoming parts.
        </div>
      )}
    </div>
  );
}
