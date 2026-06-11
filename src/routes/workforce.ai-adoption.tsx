import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Users,
  Gauge,
  Activity,
  FolderKanban,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { COLORS, GlassPanel, KpiCard, Pill } from "@/components/workforce/ui";
import { useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce/ai-adoption")({
  component: AIAdoptionPage,
});

const KPIS = [
  { title: "Active AI Users", value: "11,420", trend: "+18.2% QoQ", icon: <Users className="w-4 h-4" />, footer: "46% of workforce", accent: COLORS.indigo },
  { title: "AI Adoption Rate", value: "49.6%", trend: "+7.1 pts", icon: <Sparkles className="w-4 h-4" />, footer: "Target: 65% by FY end", accent: COLORS.teal },
  { title: "AI Maturity Score", value: "3.4 / 5", trend: "+0.4", icon: <Gauge className="w-4 h-4" />, footer: "Industry median 2.9", accent: COLORS.green },
  { title: "AI Readiness", value: "72 / 100", trend: "+6 pts", icon: <Activity className="w-4 h-4" />, footer: "Top quartile 84", accent: COLORS.amber },
  { title: "AI Projects", value: "168", trend: "+24 active", icon: <FolderKanban className="w-4 h-4" />, footer: "42 in pilot · 126 live", accent: COLORS.indigo },
];

const TOOLS = ["ChatGPT", "Copilot", "Claude", "Gemini", "Internal AI Agents"] as const;
const COMPANIES = ["Company A", "Company B", "Company C", "Company D", "Company E"];

// [adoption %, active users (k), trend]
const MATRIX: Record<string, [number, number, number][]> = {
  "Company A": [[72, 4.5, 8], [64, 4.0, 12], [38, 2.4, 6], [22, 1.4, 3], [44, 2.7, 14]],
  "Company B": [[81, 4.2, 10], [78, 4.0, 16], [52, 2.7, 9], [29, 1.5, 5], [61, 3.2, 22]],
  "Company C": [[58, 2.5, 5], [49, 2.1, 7], [31, 1.3, 4], [18, 0.8, 2], [33, 1.4, 9]],
  "Company D": [[44, 2.4, -2], [41, 2.3, 3], [22, 1.2, 1], [12, 0.7, 0], [25, 1.4, 4]],
  "Company E": [[35, 1.3, 4], [32, 1.1, 6], [16, 0.6, 2], [9, 0.3, 1], [18, 0.6, 7]],
};

const SKILLS = ["Prompt Engineering", "Data Analysis", "Automation", "AI Agents", "AI Governance"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

// distribution per [skill][level]
const HEATMAP: number[][] = [
  [22, 38, 28, 12],
  [18, 42, 30, 10],
  [28, 41, 22, 9],
  [44, 32, 18, 6],
  [36, 38, 19, 7],
];

const GAPS = [
  { skill: "AI Agents", current: 24, target: 60, gap: 36, priority: "Critical" },
  { skill: "AI Governance", current: 26, target: 55, gap: 29, priority: "High" },
  { skill: "Automation", current: 31, target: 55, gap: 24, priority: "High" },
  { skill: "Prompt Engineering", current: 40, target: 65, gap: 25, priority: "High" },
  { skill: "Data Analysis", current: 40, target: 60, gap: 20, priority: "Medium" },
];

function cellTone(pct: number) {
  if (pct >= 70) return COLORS.green;
  if (pct >= 50) return COLORS.teal;
  if (pct >= 30) return COLORS.amber;
  return COLORS.red;
}

function AIAdoptionPage() {
  const { companyLabel } = useWorkforce();
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.18em] text-slate-500 mb-1">
          WORKSPACE · {companyLabel.toUpperCase()}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          AI Adoption & Skills
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <GlassPanel title="AI Tool Adoption Matrix" description="Adoption %, active users (k) and QoQ trend">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="text-left py-2 pr-3">Company</th>
                {TOOLS.map((t) => (
                  <th key={t} className="text-center py-2 px-2">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPANIES.map((c) => (
                <tr key={c} className="border-b border-slate-200 last:border-0">
                  <td className="py-2.5 pr-3 text-slate-900 text-[13px]">{c}</td>
                  {MATRIX[c].map(([adopt, users, trend], i) => {
                    const tone = cellTone(adopt);
                    return (
                      <td key={i} className="py-2 px-1.5">
                        <div
                          className="rounded-lg p-2 border"
                          style={{
                            backgroundColor: `${tone}10`,
                            borderColor: `${tone}33`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[14px] font-semibold" style={{ color: tone, fontFamily: "Outfit, sans-serif" }}>
                              {adopt}%
                            </span>
                            <span className="inline-flex items-center text-[10px]" style={{ color: trend >= 0 ? COLORS.green : COLORS.red }}>
                              {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                              {trend >= 0 ? "+" : ""}{trend}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{users}k users</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      <div className="grid xl:grid-cols-2 gap-6">
        <GlassPanel title="Skills Heatmap" description="% of workforce at each proficiency level">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="text-left py-2 pr-3">Skill</th>
                  {LEVELS.map((l) => (
                    <th key={l} className="text-center py-2 px-2">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SKILLS.map((s, i) => (
                  <tr key={s} className="border-b border-slate-200 last:border-0">
                    <td className="py-2 pr-3 text-slate-200">{s}</td>
                    {HEATMAP[i].map((v, j) => {
                      const palette = [COLORS.red, COLORS.amber, COLORS.teal, COLORS.green];
                      const c = palette[j];
                      const intensity = Math.min(1, v / 50);
                      return (
                        <td key={j} className="py-1.5 px-1">
                          <div
                            className="rounded-md py-2 text-center text-[12px] font-semibold border"
                            style={{
                              backgroundColor: `${c}${Math.round(intensity * 60 + 10).toString(16).padStart(2, "0")}`,
                              borderColor: `${c}44`,
                              color: c,
                              fontFamily: "Outfit, sans-serif",
                            }}
                          >
                            {v}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        <GlassPanel title="Skill Gap Analysis" description="Current vs target proficient workforce share">
          <div className="space-y-3">
            {GAPS.map((g) => (
              <div key={g.skill} className="rounded-xl border border-slate-200 p-3" style={{ backgroundColor: "#f8fafc" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-slate-900">{g.skill}</span>
                  <Pill
                    label={g.priority}
                    tone={g.priority === "Critical" ? "red" : g.priority === "High" ? "amber" : "indigo"}
                  />
                </div>
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="absolute h-full" style={{ width: `${g.current}%`, backgroundColor: COLORS.teal }} />
                  <div
                    className="absolute h-full border-l-2"
                    style={{ left: `${g.target}%`, borderColor: COLORS.indigo, height: "100%" }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 mt-1.5">
                  <span>Current <span className="text-slate-900">{g.current}%</span></span>
                  <span>Target <span style={{ color: COLORS.indigo }}>{g.target}%</span></span>
                  <span>Gap <span style={{ color: COLORS.red }}>{g.gap} pts</span></span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
