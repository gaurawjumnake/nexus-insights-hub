import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Gauge, Clock, DollarSign, Coins, TrendingUp, Scissors } from "lucide-react";
import { COLORS, GlassPanel, KpiCard, Pill } from "@/components/workforce/ui";
import { useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce/productivity")({
  component: ProductivityPage,
});

const KPIS = [
  { title: "Productivity Gain", value: "+17.4%", trend: "+3.2 pts QoQ", icon: <Gauge className="w-4 h-4" />, footer: "Weighted across portfolio", accent: COLORS.green },
  { title: "Hours Saved", value: "248k", trend: "+62k QoQ", icon: <Clock className="w-4 h-4" />, footer: "Trailing quarter", accent: COLORS.teal },
  { title: "Cost Savings", value: "$32.1M", trend: "+$7.4M QoQ", icon: <DollarSign className="w-4 h-4" />, footer: "Annualized", accent: COLORS.green },
  { title: "AI Spend", value: "$11.8M", trend: "+12.6% QoQ", icon: <Coins className="w-4 h-4" />, footer: "Licenses + infra + services", accent: COLORS.amber },
  { title: "ROI", value: "2.7x", trend: "+0.4x", icon: <TrendingUp className="w-4 h-4" />, footer: "Trailing 12 months", accent: COLORS.indigo },
];

const PROD_BY_CO = [
  { name: "Co. A", value: 18 },
  { name: "Co. B", value: 23 },
  { name: "Co. C", value: 14 },
  { name: "Co. D", value: 9 },
  { name: "Co. E", value: 6 },
];

const COST_PER_OUTCOME = [
  { name: "Co. A", value: 42 },
  { name: "Co. B", value: 31 },
  { name: "Co. C", value: 58 },
  { name: "Co. D", value: 74 },
  { name: "Co. E", value: 88 },
];

const SPEND_TREND = [
  { m: "Q1 '25", spend: 6.4, savings: 11.2 },
  { m: "Q2 '25", spend: 7.8, savings: 16.4 },
  { m: "Q3 '25", spend: 9.1, savings: 22.6 },
  { m: "Q4 '25", spend: 10.5, savings: 27.9 },
  { m: "Q1 '26", spend: 11.8, savings: 32.1 },
];

const ROI_COMP = [
  { name: "Co. A", roi: 2.8 },
  { name: "Co. B", roi: 3.4 },
  { name: "Co. C", roi: 3.8 },
  { name: "Co. D", roi: 1.6 },
  { name: "Co. E", roi: 1.2 },
];

const OPPS = [
  { cat: "License Reduction", savings: "$1.8M", complexity: "Low", roi: "5.2x", tone: "green" as const },
  { cat: "Model Optimization", savings: "$2.4M", complexity: "Medium", roi: "3.8x", tone: "teal" as const },
  { cat: "Vendor Consolidation", savings: "$1.2M", complexity: "Medium", roi: "2.9x", tone: "indigo" as const },
  { cat: "Workforce Automation", savings: "$6.4M", complexity: "High", roi: "4.4x", tone: "amber" as const },
  { cat: "Contractor Reduction", savings: "$3.6M", complexity: "Medium", roi: "3.1x", tone: "amber" as const },
];

function ProductivityPage() {
  const { companyLabel } = useWorkforce();
  const palette = [COLORS.indigo, COLORS.teal, COLORS.green, COLORS.amber, COLORS.red];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.18em] text-slate-500 mb-1">
          WORKSPACE · {companyLabel.toUpperCase()}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Productivity & Cost
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <GlassPanel title="Productivity by Company" description="Quarterly productivity uplift (%)">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={PROD_BY_CO} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={chartTip} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {PROD_BY_CO.map((_, i) => <Cell key={i} fill={palette[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Cost Per Outcome" description="$ per AI-assisted outcome (lower is better)">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={COST_PER_OUTCOME} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={chartTip} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={COLORS.teal} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="AI Spend vs Savings Trend" description="Quarterly, $M">
          <div className="h-60">
            <ResponsiveContainer>
              <AreaChart data={SPEND_TREND} margin={{ left: -10, right: 8 }}>
                <defs>
                  <linearGradient id="gSpend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSave" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="m" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={chartTip} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Area type="monotone" dataKey="spend" name="AI Spend" stroke={COLORS.amber} fill="url(#gSpend)" strokeWidth={2} />
                <Area type="monotone" dataKey="savings" name="Cost Savings" stroke={COLORS.green} fill="url(#gSave)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="ROI Comparison" description="Trailing-12-month return multiple">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={ROI_COMP} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={chartTip} />
                <Line type="monotone" dataKey="roi" stroke={COLORS.indigo} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.indigo }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel
        title="Cost Optimization Center"
        description="Ranked opportunities by impact and ease of execution"
        action={<Scissors className="w-4 h-4" style={{ color: COLORS.amber }} />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="text-left py-2 pr-3">Opportunity</th>
                <th className="text-right py-2 pr-3">Savings</th>
                <th className="text-left py-2 pr-3">Complexity</th>
                <th className="text-right py-2">ROI</th>
              </tr>
            </thead>
            <tbody>
              {OPPS.map((o) => (
                <tr key={o.cat} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                  <td className="py-2.5 pr-3 text-slate-900">{o.cat}</td>
                  <td className="py-2.5 pr-3 text-right font-medium" style={{ color: COLORS.green }}>{o.savings}</td>
                  <td className="py-2.5 pr-3">
                    <Pill
                      label={o.complexity}
                      tone={o.complexity === "Low" ? "green" : o.complexity === "Medium" ? "amber" : "red"}
                    />
                  </td>
                  <td className="py-2.5 text-right font-medium" style={{ color: COLORS.indigo }}>{o.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

const chartTip = {
  backgroundColor: "#0d1222",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
};
