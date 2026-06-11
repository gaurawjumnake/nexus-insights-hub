import { createFileRoute } from "@tanstack/react-router";
import { useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce/")({
  component: BoardroomDashboard,
});

function BoardroomDashboard() {
  const { companyLabel } = useWorkforce();
  return <PagePlaceholder title="Boardroom Dashboard" company={companyLabel} />;
}

export function PagePlaceholder({ title, company }: { title: string; company: string }) {
  return (
    <div
      className="rounded-2xl p-10 border border-white/5"
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(20,184,166,0.04) 100%), #0d1222",
      }}
    >
      <div className="text-[11px] tracking-[0.18em] text-slate-500 mb-2">
        WORKSPACE · {company.toUpperCase()}
      </div>
      <h1
        className="text-3xl font-semibold text-white"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {title}
      </h1>
      <p className="mt-3 text-sm text-slate-400 max-w-xl">
        This page is wired into the navigation. Content will be populated in upcoming parts.
      </p>
    </div>
  );
}
