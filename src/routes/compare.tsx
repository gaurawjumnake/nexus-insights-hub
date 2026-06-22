import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePortfolioKpis } from "@/hooks/usePortfolioKpis";
import { kpi as kpiOf, kpiValue } from "@/lib/normaliseKpi";
import { getKpiTrend } from "@/services/kpiService";
import { buildTrailingWindow, type Grain } from "@/lib/periods";

export const Route = createFileRoute("/compare")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Portfolio Comparison — Nexus" },
      { name: "description", content: "Side-by-side KPI comparison across portfolio companies." },
    ],
  }),
  component: ComparePage,
});

// ─── KPI catalog ─────────────────────────────────────────────────────────────

type KpiRow = { id: string; label: string; category?: string; lowerIsBetter?: boolean };
type PersonaKey = "cxo" | "business" | "technology" | "operations";

const PERSONAS: { key: PersonaKey; label: string; accent: string }[] = [
  { key: "cxo",        label: "CXO",        accent: "bg-indigo-500" },
  { key: "business",   label: "Business",   accent: "bg-teal-500" },
  { key: "technology", label: "Technology", accent: "bg-violet-500" },
  { key: "operations", label: "Operations", accent: "bg-amber-500" },
];

const KPIS: Record<PersonaKey, KpiRow[]> = {
  cxo: [
    { id: "ai_revenue",                   label: "AI Revenue",         category: "Value" },
    { id: "ebitda_uplift",                label: "EBITDA Uplift",      category: "Value" },
    { id: "ai_roi",                       label: "AI ROI",             category: "Value" },
    { id: "cost_savings",                 label: "Cost Savings",       category: "Value" },
    { id: "ai_maturity_score",            label: "AI Maturity Score",  category: "Maturity" },
    { id: "portfolio_ai_adoption_score",  label: "AI Adoption Score",  category: "Maturity" },
    { id: "ai_governance_score",          label: "Governance Score",   category: "Risk" },
    { id: "regulatory_readiness",         label: "Regulatory Readiness",category: "Risk" },
    { id: "total_ai_spend",               label: "Total AI Spend",     category: "Cost", lowerIsBetter: true },
  ],
  business: [
    { id: "direct_ai_revenue",            label: "Direct AI Revenue",  category: "Revenue" },
    { id: "ai_assisted_revenue",          label: "AI-Assisted Revenue",category: "Revenue" },
    { id: "pipeline_influenced_revenue",  label: "Pipeline Influenced",category: "Revenue" },
    { id: "cross_sell_uplift",            label: "Cross-Sell Uplift",  category: "Revenue" },
    { id: "productivity_gain",            label: "Productivity Gain",  category: "Efficiency" },
    { id: "cost_per_outcome",             label: "Cost per Outcome",   category: "Efficiency", lowerIsBetter: true },
    { id: "top_quartile_position",        label: "Top-Quartile Position", category: "Benchmark" },
    { id: "industry_benchmark_ratio",     label: "Industry Benchmark", category: "Benchmark" },
  ],
  technology: [
    { id: "availability_uptime",          label: "Platform Uptime",    category: "Platform" },
    { id: "api_success_rate",             label: "API Success Rate",   category: "Platform" },
    { id: "error_rate",                   label: "Error Rate",         category: "Platform", lowerIsBetter: true },
    { id: "fallback_rate",                label: "Model Fallback Rate",category: "Models",   lowerIsBetter: true },
    { id: "percent_ai_in_production",     label: "% AI in Production", category: "Models" },
    { id: "production_ratio",             label: "Prod/POC Ratio",     category: "Models" },
    { id: "cloud_spend",                  label: "Cloud Spend",        category: "FinOps",  lowerIsBetter: true },
    { id: "api_licensing_spend",          label: "API & Licensing",    category: "FinOps",  lowerIsBetter: true },
    { id: "technical_maturity_score",     label: "Tech Maturity",      category: "Maturity" },
    { id: "data_privacy_compliance",      label: "Data Privacy",       category: "Risk" },
  ],
  operations: [
    { id: "total_ai_projects",            label: "Total AI Projects" },
    { id: "projects_in_production",       label: "In Production" },
    { id: "projects_in_poc",              label: "In POC" },
    { id: "stalled_projects",             label: "Stalled Projects",   lowerIsBetter: true },
    { id: "adoption_yoy_growth",          label: "Adoption YoY Growth" },
    { id: "active_ai_users",              label: "Active AI Users" },
    { id: "copilot_adoption",             label: "Copilot Adoption" },
    { id: "budget_adherence",             label: "Budget Adherence" },
    { id: "budget_variance",              label: "Budget Variance",    lowerIsBetter: true },
    { id: "human_review_coverage",        label: "Human Review Coverage" },
    { id: "policy_compliance_rate",       label: "Policy Compliance" },
  ],
};

// ─── Chart color palette ──────────────────────────────────────────────────────

const CHART_COLORS = ["#6366f1", "#14b8a6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

// ─── Trend grain tabs ─────────────────────────────────────────────────────────

type TrendGrain = { label: string; grain: Grain };
const TREND_TABS: TrendGrain[] = [
  { label: "MOM", grain: "M" },
  { label: "QOQ", grain: "Q" },
  { label: "YOY", grain: "A" },
];

// KPI shown in the trend chart — ai_revenue is the most universally meaningful
const TREND_KPI = "ai_revenue";
const TREND_KPI_LABEL = "AI Revenue";

// ─── Chart section (line + pie) ───────────────────────────────────────────────

function ChartSection({
  companies,
  perCompany,
}: {
  companies: { id: string; label: string }[];
  perCompany: Record<string, Record<string, import("@/lib/normaliseKpi").NormalisedKpi>>;
}) {
  const [grain, setGrain] = useState<Grain>("M");
  const window = buildTrailingWindow(grain);

  const trendQueries = useQueries({
    queries: companies.map((c) => ({
      queryKey: ["kpi-trend", c.id, window.periodType, window.startPeriod, window.endPeriod, TREND_KPI],
      queryFn: () => getKpiTrend(c.id, [TREND_KPI], window.periodType, window.startPeriod, window.endPeriod),
      staleTime: 2 * 60 * 1000,
      enabled: companies.length > 0,
      throwOnError: false as const,
    })),
  });

  const lineData = useMemo(() => {
    return window.periods.map(({ period, label }) => {
      const row: Record<string, string | number | null> = { p: label };
      companies.forEach((c, idx) => {
        const results = trendQueries[idx]?.data?.results?.[TREND_KPI] ?? [];
        const match = results.find((r) => r.period === period);
        const v = match ? (typeof match.value === "number" && Number.isFinite(match.value) ? match.value : null) : null;
        row[c.id] = v;
      });
      return row;
    });
  }, [window.periods, companies, trendQueries]);

  const pieData = useMemo(() =>
    companies
      .map((c) => ({ name: c.label, value: kpiValue(perCompany[c.id] ?? {}, TREND_KPI) }))
      .filter((d): d is { name: string; value: number } => d.value !== null),
    [companies, perCompany]
  );

  const isFetching = trendQueries.some((q) => q.isFetching);
  const isLoading  = trendQueries.some((q) => q.isLoading);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-5">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-slate-400" />
          <span className="text-[13px] font-semibold text-slate-800">{TREND_KPI_LABEL} Trend</span>
          {isFetching && !isLoading && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>
        <div className="flex gap-1">
          {TREND_TABS.map((t) => (
            <button
              key={t.grain}
              onClick={() => setGrain(t.grain)}
              className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors ${
                grain === t.grain
                  ? "bg-teal-500 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-0 divide-x divide-slate-100">
        {/* Line chart — 2/3 width */}
        <div className="lg:col-span-2 p-5">
          {isLoading ? (
            <div className="h-52 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <div className="h-52">
              <ResponsiveContainer>
                <LineChart data={lineData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="p" stroke="#94a3b8" fontSize={11} tick={{ fill: "#94a3b8" }} />
                  <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: "#94a3b8" }} width={55}
                    tickFormatter={(v) => {
                      if (typeof v !== "number") return v;
                      if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
                      if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}K`;
                      return `$${v}`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => {
                      if (!Number.isFinite(v)) return ["—"];
                      if (Math.abs(v) >= 1_000_000) return [`$${(v / 1_000_000).toFixed(1)}M`];
                      if (Math.abs(v) >= 1_000) return [`$${Math.round(v / 1_000)}K`];
                      return [`$${v}`];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                  {companies.map((c, i) => (
                    <Line
                      key={c.id}
                      dataKey={c.id}
                      name={c.label}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie chart — 1/3 width */}
        <div className="p-5 flex flex-col">
          <div className="text-[12px] font-semibold text-slate-700 mb-3">Portfolio Share (latest)</div>
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[12px] text-slate-400">No data</div>
          ) : (
            <div className="flex-1 min-h-[180px]">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => {
                      if (Math.abs(v) >= 1_000_000) return [`$${(v / 1_000_000).toFixed(1)}M`];
                      if (Math.abs(v) >= 1_000) return [`$${Math.round(v / 1_000)}K`];
                      return [`$${v}`];
                    }}
                  />
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ComparePage() {
  const [active, setActive] = useState<PersonaKey>("cxo");
  const { companies, perCompany, isLoadingCompanies, isLoadingKpis, error } = usePortfolioKpis();

  const rows = KPIS[active];

  const liveStatus = isLoadingCompanies || isLoadingKpis
    ? "loading"
    : error ? "offline" : "live";

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Portfolio KPI Comparison
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Side-by-side KPI snapshot across all portfolio companies, sourced live from the KPI pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className={`w-2 h-2 rounded-full ${
              liveStatus === "live" ? "bg-emerald-500" : liveStatus === "loading" ? "bg-amber-400 animate-pulse" : "bg-rose-400"
            }`} />
            {liveStatus === "live" ? "Live data" : liveStatus === "loading" ? "Loading KPIs…" : "Unable to load KPI data"}
          </div>
        </div>

        {/* Error state */}
        {!isLoadingCompanies && companies.length === 0 && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> No companies returned by the API.
          </div>
        )}

        {/* Charts section — line + pie with MOM/QOQ/YOY tabs */}
        {!isLoadingCompanies && companies.length > 0 && (
          <ChartSection companies={companies} perCompany={perCompany} />
        )}

        {/* Persona tabs */}
        <div className="flex gap-1 mb-0 border-b border-slate-200">
          {PERSONAS.map((p) => {
            const isActive = p.key === active;
            return (
              <button
                key={p.key}
                onClick={() => setActive(p.key)}
                className={`px-5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                  isActive ? "border-teal-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.accent}`} />
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="text-left font-semibold px-5 py-3 w-[28%]">KPI</th>
                {companies.map((pc) => (
                  <th key={pc.id} className="text-right font-semibold px-5 py-3">{pc.label}</th>
                ))}
                {companies.length === 0 && <th className="text-right font-semibold px-5 py-3">—</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const values = companies
                  .map((c) => kpiValue(perCompany[c.id] ?? {}, row.id))
                  .filter((v): v is number => typeof v === "number");
                const best  = values.length ? (row.lowerIsBetter ? Math.min(...values) : Math.max(...values)) : null;
                const worst = values.length ? (row.lowerIsBetter ? Math.max(...values) : Math.min(...values)) : null;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="text-[13px] font-medium text-slate-900">{row.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="font-mono">{row.id}</span>
                        {row.category && <><span>·</span><span>{row.category}</span></>}
                      </div>
                    </td>
                    {companies.map((pc) => {
                      const map = perCompany[pc.id] ?? {};
                      const display = isLoadingKpis ? null : kpiOf(map, row.id, "—");
                      const num = kpiValue(map, row.id);
                      const color =
                        num !== null && best !== null && num === best && values.length > 1
                          ? "text-emerald-600"
                          : num !== null && worst !== null && num === worst && values.length > 1
                          ? "text-rose-600"
                          : "text-slate-900";
                      return (
                        <td key={pc.id} className={`px-5 py-3 text-right font-mono text-[14px] ${color}`}>
                          {display === null
                            ? <span className="inline-block h-4 w-14 animate-pulse rounded bg-slate-200 align-middle" />
                            : display}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 text-[11px] text-slate-400">
            Green = best in portfolio · Red = worst. Cost-style KPIs invert the scale — lower wins.
          </div>
        </div>
      </div>
    </div>
  );
}
