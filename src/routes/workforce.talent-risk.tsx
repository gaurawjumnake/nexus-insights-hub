import { createFileRoute } from "@tanstack/react-router";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingDown,
  HeartHandshake,
  Shield,
  Crown,
  GraduationCap,
} from "lucide-react";
import { COLORS, GlassPanel, KpiCard, Pill } from "@/components/workforce/ui";
import { useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce/talent-risk")({
  component: TalentRiskPage,
});

const KPIS = [
  { title: "Attrition", value: "11.4%", trend: "-1.3% YoY", icon: <TrendingDown className="w-4 h-4" />, footer: "Benchmark 13.2%", accent: COLORS.amber },
  { title: "Engagement", value: "78%", trend: "+2.4 pts", icon: <HeartHandshake className="w-4 h-4" />, footer: "Survey response 91%", accent: COLORS.green },
  { title: "Retention", value: "88.6%", trend: "+1.3 pts", icon: <Shield className="w-4 h-4" />, footer: "Critical roles 92.1%", accent: COLORS.teal },
  { title: "Succession Coverage", value: "64%", trend: "+5 pts", icon: <Crown className="w-4 h-4" />, footer: "Top 25 roles", accent: COLORS.indigo },
  { title: "Training Completion", value: "82%", trend: "+11 pts", icon: <GraduationCap className="w-4 h-4" />, footer: "AI literacy track", accent: COLORS.indigo },
];

const COMPANIES = ["Company A", "Company B", "Company C", "Company D", "Company E"];
const RISK_CATS = ["Attrition", "Leadership Gaps", "Critical Skills", "Succession", "Change Fatigue"];

// 0=Low,1=Medium,2=High,3=Critical
const HEAT: number[][] = [
  [1, 1, 2, 1, 0],
  [0, 0, 1, 1, 0],
  [2, 2, 2, 1, 1],
  [3, 2, 3, 2, 2],
  [2, 1, 2, 2, 3],
];
const LEVEL_LABEL = ["Low", "Medium", "High", "Critical"];
const LEVEL_COLOR = [COLORS.green, COLORS.teal, COLORS.amber, COLORS.red];

const LEARN = [
  { label: "Courses Completed", value: "12,840", note: "+24% QoQ", color: COLORS.indigo },
  { label: "Certifications", value: "1,962", note: "+312 this quarter", color: COLORS.teal },
  { label: "AI Training Participation", value: "71%", note: "Target 85%", color: COLORS.green },
  { label: "Skill Improvement", value: "+0.6", note: "Avg level lift", color: COLORS.amber },
  { label: "Learning Hours", value: "48,210", note: "Trailing quarter", color: COLORS.indigo },
];

const HEALTH = [
  { metric: "Engagement", score: 78 },
  { metric: "Retention", score: 88 },
  { metric: "Internal Mobility", score: 62 },
  { metric: "Leadership Strength", score: 71 },
  { metric: "Change Readiness", score: 68 },
];

function TalentRiskPage() {
  const { companyLabel } = useWorkforce();
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.18em] text-slate-500 mb-1">
          WORKSPACE · {companyLabel.toUpperCase()}
        </div>
        <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          Talent Risk & Learning
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <GlassPanel title="Talent Risk Heatmap" description="Risk level by company and category">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-white/5">
                <th className="text-left py-2 pr-3">Company</th>
                {RISK_CATS.map((c) => (
                  <th key={c} className="text-center py-2 px-2">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPANIES.map((co, i) => (
                <tr key={co} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5 pr-3 text-white text-[13px]">{co}</td>
                  {HEAT[i].map((lvl, j) => {
                    const c = LEVEL_COLOR[lvl];
                    return (
                      <td key={j} className="py-1.5 px-1">
                        <div
                          className="rounded-md py-2 text-center text-[11px] font-semibold border"
                          style={{
                            backgroundColor: `${c}1f`,
                            borderColor: `${c}55`,
                            color: c,
                          }}
                        >
                          {LEVEL_LABEL[lvl]}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-2 mt-3">
            {LEVEL_LABEL.map((l, i) => (
              <Pill key={l} label={l} tone={["green", "teal", "amber", "red"][i] as never} />
            ))}
          </div>
        </div>
      </GlassPanel>

      <div className="grid xl:grid-cols-2 gap-6">
        <GlassPanel title="Learning Dashboard" description="L&D engagement and outcomes">
          <div className="grid sm:grid-cols-2 gap-3">
            {LEARN.map((l) => (
              <div key={l.label} className="rounded-xl border border-white/5 p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{l.label}</div>
                <div className="mt-1 text-[20px] font-semibold" style={{ color: l.color, fontFamily: "Outfit, sans-serif" }}>
                  {l.value}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{l.note}</div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel title="Organizational Health Scorecard" description="Composite metric scores (0–100)">
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={HEALTH}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Radar
                  dataKey="score"
                  stroke={COLORS.indigo}
                  fill={COLORS.indigo}
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {HEALTH.map((h) => (
              <div key={h.metric} className="text-center">
                <div className="text-[11px] text-slate-500 truncate">{h.metric}</div>
                <div className="text-[14px] font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{h.score}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
