import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users,
  Sparkles,
  Gauge,
  TrendingDown,
  HeartHandshake,
  ChevronDown,
  AlertTriangle,
  Target,
  Lightbulb,
  Calculator,
} from "lucide-react";
import { COLORS, GlassPanel, KpiCard, Pill } from "@/components/workforce/ui";
import { useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce/")({
  component: BoardroomDashboard,
});

const KPIS = [
  {
    title: "Total Employees",
    value: "24,830",
    trend: "+3.1% QoQ",
    icon: <Users className="w-4 h-4" />,
    footer: "Across 5 portfolio companies",
    accent: COLORS.indigo,
  },
  {
    title: "AI Enabled Employees",
    value: "11,420",
    trend: "+18.2% QoQ",
    icon: <Sparkles className="w-4 h-4" />,
    footer: "46% of total workforce",
    accent: COLORS.teal,
  },
  {
    title: "AI Readiness Score",
    value: "72 / 100",
    trend: "+6 pts",
    icon: <Gauge className="w-4 h-4" />,
    footer: "Top quartile: 84",
    accent: COLORS.green,
  },
  {
    title: "Attrition Rate",
    value: "11.4%",
    trend: "-1.3% YoY",
    trendDirection: "up" as const,
    icon: <TrendingDown className="w-4 h-4" />,
    footer: "Benchmark: 13.2%",
    accent: COLORS.amber,
  },
  {
    title: "Engagement Score",
    value: "78%",
    trend: "+2.4 pts",
    icon: <HeartHandshake className="w-4 h-4" />,
    footer: "Survey response 91%",
    accent: COLORS.indigo,
  },
];

const ADVISOR_QUESTIONS = [
  {
    q: "Which portfolio company has highest AI adoption?",
    a: "Company B leads with 68% AI-enabled workforce, driven by aggressive Copilot rollout and a centralized enablement team.",
    kpi: "AI Adoption · 68% (vs portfolio avg 46%)",
    rec: "Promote Company B's enablement playbook to Companies D and E within the next operating cycle.",
  },
  {
    q: "Which company has strongest AI talent?",
    a: "Company A holds the deepest AI talent bench with 142 ML/Data engineers and a 4.6/5 internal skills index.",
    kpi: "AI Skills Index · 4.6 / 5",
    rec: "Establish a cross-portfolio AI Center of Excellence anchored at Company A.",
  },
  {
    q: "Which company has highest attrition risk?",
    a: "Company D shows 18.7% trailing-12-month attrition, concentrated in mid-level engineering and revenue ops.",
    kpi: "Attrition · 18.7% · Critical roles 27%",
    rec: "Deploy targeted retention bonuses and accelerate L&D pathways for high-risk cohorts.",
  },
  {
    q: "Which company needs AI upskilling?",
    a: "Company E has the lowest readiness (54/100), with 61% of staff lacking foundational AI literacy.",
    kpi: "Readiness · 54 / 100",
    rec: "Fund a 90-day enterprise AI literacy program; target 80% completion by next board cycle.",
  },
  {
    q: "Which company delivers highest productivity gains?",
    a: "Company B has delivered a 23% productivity uplift in shared services post-automation rollout.",
    kpi: "Productivity Δ · +23%",
    rec: "Codify the automation pattern library and replicate across Companies A and C.",
  },
  {
    q: "Which company should receive more AI investment?",
    a: "Company C offers the highest projected ROI on incremental AI spend at 3.8x within 18 months.",
    kpi: "Projected ROI · 3.8x",
    rec: "Allocate an additional $4.2M to Company C's automation roadmap in FY plan.",
  },
];

const RECOMMENDATIONS = [
  { p: "P0", c: "Company D", impact: "High", rec: "Launch retention program for critical engineering roles", value: "$3.8M" },
  { p: "P0", c: "Company E", impact: "High", rec: "Enterprise AI literacy bootcamp (90 days)", value: "$2.1M" },
  { p: "P1", c: "Company B", impact: "High", rec: "Scale automation playbook to shared services", value: "$5.4M" },
  { p: "P1", c: "Company A", impact: "Medium", rec: "Stand up portfolio AI Center of Excellence", value: "$4.6M" },
  { p: "P1", c: "Company C", impact: "High", rec: "Fund incremental automation roadmap (FY27)", value: "$4.2M" },
  { p: "P2", c: "Company D", impact: "Medium", rec: "Rationalize Copilot license footprint", value: "$0.9M" },
  { p: "P2", c: "Company A", impact: "Medium", rec: "Succession planning for top 25 roles", value: "$1.5M" },
  { p: "P2", c: "Company E", impact: "Medium", rec: "Contractor-to-FTE conversion (eng)", value: "$2.7M" },
  { p: "P3", c: "Company B", impact: "Low", rec: "Refresh engagement survey cadence", value: "$0.3M" },
  { p: "P3", c: "Company C", impact: "Low", rec: "Consolidate L&D vendor stack", value: "$0.6M" },
];

const RISKS = [
  { cat: "Attrition Risk", level: "High", count: 18, note: "Mid-level eng at Company D", tone: "red" as const },
  { cat: "Skill Gaps", level: "Medium", count: 12, note: "GenAI fluency, data engineering", tone: "amber" as const },
  { cat: "Succession Risk", level: "Medium", count: 9, note: "Top 25 roles · 36% uncovered", tone: "amber" as const },
  { cat: "Change Resistance", level: "Low", count: 5, note: "Field ops at Company E", tone: "green" as const },
  { cat: "AI Adoption Risk", level: "Medium", count: 7, note: "Lagging adoption in Co. E", tone: "amber" as const },
];

const OPPORTUNITIES = [
  { cat: "AI Scaling", value: "$12.4M", note: "Replicate Co. B playbook portfolio-wide", tone: "teal" as const },
  { cat: "Training Investment", value: "$4.8M", note: "AI literacy + role-based pathways", tone: "indigo" as const },
  { cat: "License Optimization", value: "$1.6M", note: "Right-size Copilot/SaaS seats", tone: "green" as const },
  { cat: "Automation Expansion", value: "$8.9M", note: "Shared services + finance ops", tone: "teal" as const },
  { cat: "Workforce Rationalization", value: "$5.2M", note: "Contractor consolidation", tone: "amber" as const },
];

function BoardroomDashboard() {
  const { companyLabel } = useWorkforce();
  const [open, setOpen] = useState<number | null>(0);

  const [upskill, setUpskill] = useState(40);
  const [contractor, setContractor] = useState(20);
  const [automation, setAutomation] = useState(35);

  const calc = useMemo(() => {
    const ebitda = (upskill * 0.18 + contractor * 0.22 + automation * 0.28).toFixed(1);
    const savings = ((upskill * 0.12 + contractor * 0.4 + automation * 0.35) * 0.1).toFixed(1);
    const prod = (upskill * 0.5 + automation * 0.7).toFixed(0);
    const roi = (
      (Number(ebitda) + Number(savings) * 2) /
      Math.max(1, (upskill + contractor + automation) / 30)
    ).toFixed(2);
    return { ebitda, savings, prod, roi };
  }, [upskill, contractor, automation]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.18em] text-slate-500 mb-1">
          WORKSPACE · {companyLabel.toUpperCase()}
        </div>
        <h1
          className="text-2xl font-semibold text-slate-900"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Boardroom Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPIS.map((k) => (
          <KpiCard key={k.title} {...k} />
        ))}
      </div>

      <GlassPanel
        title="Executive Advisor"
        description="Strategic questions answered with supporting KPIs and recommendations"
      >
        <div className="space-y-2">
          {ADVISOR_QUESTIONS.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={item.q}
                className="rounded-xl border border-slate-200"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-semibold"
                      style={{
                        backgroundColor: `${COLORS.indigo}22`,
                        color: COLORS.indigo,
                      }}
                    >
                      Q{idx + 1}
                    </div>
                    <span className="text-[13px] text-slate-900">{item.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-600 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-200 grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                        Answer
                      </div>
                      <p className="text-[13px] text-slate-200 leading-relaxed">{item.a}</p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                        Supporting KPI
                      </div>
                      <div
                        className="text-[13px] font-medium"
                        style={{ color: COLORS.teal }}
                      >
                        {item.kpi}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                        Recommendation
                      </div>
                      <p className="text-[13px] text-slate-200 leading-relaxed">{item.rec}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <div className="grid xl:grid-cols-3 gap-6">
        <GlassPanel
          title="Executive Recommendations"
          description="Top 10 actions ranked by impact and value"
          className="xl:col-span-2"
          action={<Pill label="Top 10" tone="indigo" />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="text-left py-2 pr-3">Priority</th>
                  <th className="text-left py-2 pr-3">Company</th>
                  <th className="text-left py-2 pr-3">Impact</th>
                  <th className="text-left py-2 pr-3">Recommendation</th>
                  <th className="text-right py-2">Est. Value</th>
                </tr>
              </thead>
              <tbody>
                {RECOMMENDATIONS.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-2.5 pr-3">
                      <Pill
                        label={r.p}
                        tone={
                          r.p === "P0"
                            ? "red"
                            : r.p === "P1"
                              ? "amber"
                              : r.p === "P2"
                                ? "indigo"
                                : "slate"
                        }
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-slate-200">{r.c}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        style={{
                          color:
                            r.impact === "High"
                              ? COLORS.green
                              : r.impact === "Medium"
                                ? COLORS.amber
                                : "#94a3b8",
                        }}
                      >
                        {r.impact}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-700">{r.rec}</td>
                    <td
                      className="py-2.5 text-right font-medium"
                      style={{ color: COLORS.teal }}
                    >
                      {r.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        <GlassPanel
          title="Critical Risks"
          description="Surfaced by AI talent risk model"
          action={<AlertTriangle className="w-4 h-4" style={{ color: COLORS.red }} />}
        >
          <ul className="space-y-2.5">
            {RISKS.map((r) => (
              <li
                key={r.cat}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <div>
                  <div className="text-[13px] text-slate-900">{r.cat}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{r.note}</div>
                </div>
                <div className="text-right">
                  <Pill label={r.level} tone={r.tone} />
                  <div className="text-[10px] text-slate-500 mt-1">{r.count} flagged</div>
                </div>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <GlassPanel
          title="Value Creation Opportunities"
          description="Quantified upside across the portfolio"
          className="xl:col-span-2"
          action={<Target className="w-4 h-4" style={{ color: COLORS.teal }} />}
        >
          <div className="grid md:grid-cols-2 gap-3">
            {OPPORTUNITIES.map((o) => (
              <div
                key={o.cat}
                className="rounded-xl border border-slate-200 p-4 flex items-start justify-between"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Lightbulb
                      className="w-3.5 h-3.5"
                      style={{
                        color: {
                          teal: COLORS.teal,
                          indigo: COLORS.indigo,
                          green: COLORS.green,
                          amber: COLORS.amber,
                        }[o.tone],
                      }}
                    />
                    <span className="text-[13px] text-slate-900">{o.cat}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5">{o.note}</div>
                </div>
                <div
                  className="text-[15px] font-semibold"
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    color: COLORS.green,
                  }}
                >
                  {o.value}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel
          title="Value Creation Calculator"
          description="Model EBITDA and ROI impact"
          action={<Calculator className="w-4 h-4" style={{ color: COLORS.indigo }} />}
        >
          <div className="space-y-4">
            <Slider label="AI Upskilling %" value={upskill} onChange={setUpskill} color={COLORS.indigo} />
            <Slider label="Contractor Reduction %" value={contractor} onChange={setContractor} color={COLORS.amber} />
            <Slider label="Automation Adoption %" value={automation} onChange={setAutomation} color={COLORS.teal} />

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Output label="EBITDA Impact" value={`+${calc.ebitda}%`} color={COLORS.green} />
              <Output label="Cost Savings" value={`$${calc.savings}M`} color={COLORS.teal} />
              <Output label="Productivity Gain" value={`+${calc.prod}%`} color={COLORS.indigo} />
              <Output label="ROI" value={`${calc.roi}x`} color={COLORS.amber} />
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] text-slate-700">{label}</span>
        <span className="text-[12px] font-medium" style={{ color }}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #cbd5e1 ${value}%, #cbd5e1 100%)`,
        }}
      />
    </div>
  );
}

function Output({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-lg border border-slate-200 p-2.5"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div
        className="text-[16px] font-semibold mt-0.5"
        style={{ fontFamily: "Outfit, sans-serif", color }}
      >
        {value}
      </div>
    </div>
  );
}
