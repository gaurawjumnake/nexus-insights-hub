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
          className="text-2xl font-semibold text-white"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          {title}
        </h1>
      </div>
      {children ?? (
        <div
          className="rounded-2xl p-10 border border-white/5 text-sm text-slate-400"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(20,184,166,0.04) 100%), #0d1222",
          }}
        >
          This page is wired into the navigation. Content will be populated in upcoming parts.
        </div>
      )}
    </div>
  );
}
