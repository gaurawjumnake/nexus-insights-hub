import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { AlertCircle, ShieldAlert, Sparkles, Trophy } from "lucide-react";
import { usePortfolioKpis } from "@/hooks/usePortfolioKpis";
import { kpiValue } from "@/lib/normaliseKpi";
import { DEFAULT_PERIOD } from "@/services/kpiService";
import { InsightsDrawer, type InsightsRequest } from "@/components/InsightsDrawer";

export const Route = createFileRoute("/executive-overview")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Executive Overview — Nexus" },
      {
        name: "description",
        content: "Board-level view: value-creation ranking, portfolio risk, and AI spend efficiency across all companies.",
      },
    ],
  }),
  component: ExecutiveOverviewPage,
});

// ─── Formatting helpers ────────────────────────────────────────────────────

function fmtMoney(n: number | null): string {
  if (n === null) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtX(n: number | null): string {
  return n === null ? "—" : `${n.toFixed(2)}x`;
}

function fmtPct(n: number | null): string {
  return n === null ? "—" : `${n.toFixed(0)}%`;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ─── Risk heatmap ───────────────────────────────────────────────────────────

type RiskLevel = "good" | "watch" | "risk" | "unknown";

const RISK_STYLES: Record<RiskLevel, string> = {
  good: "bg-emerald-100 text-emerald-800 border-emerald-200",
  watch: "bg-amber-100 text-amber-800 border-amber-200",
  risk: "bg-rose-100 text-rose-800 border-rose-200",
  unknown: "bg-slate-100 text-slate-400 border-slate-200",
};

function scoreLevel(value: number | null): RiskLevel {
  if (value === null) return "unknown";
  if (value >= 80) return "good";
  if (value >= 60) return "watch";
  return "risk";
}

/** Lower is better (e.g. stalled-project ratio). */
function inverseLevel(value: number | null): RiskLevel {
  if (value === null) return "unknown";
  if (value <= 10) return "good";
  if (value <= 25) return "watch";
  return "risk";
}

const RISK_DIMENSIONS = [
  { key: "governance", label: "Governance", kpiId: "ai_governance_score" },
  { key: "regulatory", label: "Regulatory Readiness", kpiId: "regulatory_readiness" },
  { key: "privacy", label: "Data Privacy", kpiId: "data_privacy_compliance" },
  { key: "stalled", label: "Stalled Projects", kpiId: "stalled_projects" },
] as const;

// ─── Page ───────────────────────────────────────────────────────────────────

function ExecutiveOverviewPage() {
  const { companies, perCompany, isLoadingCompanies, isLoadingKpis, error } = usePortfolioKpis();
  const [insightsRequest, setInsightsRequest] = useState<InsightsRequest | null>(null);

  const liveStatus = isLoadingCompanies || isLoadingKpis ? "loading" : error ? "offline" : "live";

  // ── Leaderboard ──
  const leaderboard = useMemo(() => {
    return companies
      .map((c) => {
        const map = perCompany[c.id] ?? {};
        return {
          id: c.id,
          label: c.label,
          roi: kpiValue(map, "ai_roi"),
          ebitda: kpiValue(map, "ebitda_uplift"),
          costSavings: kpiValue(map, "cost_savings"),
        };
      })
      .sort((a, b) => (b.roi ?? -Infinity) - (a.roi ?? -Infinity));
  }, [companies, perCompany]);

  const maxRoi = Math.max(1, ...leaderboard.map((r) => r.roi ?? 0));

  // ── Risk heatmap ──
  const riskRows = useMemo(() => {
    return companies.map((c) => {
      const map = perCompany[c.id] ?? {};
      const totalProjects = kpiValue(map, "total_ai_projects");
      const stalledProjects = kpiValue(map, "stalled_projects");
      const stalledRatio =
        totalProjects && totalProjects > 0 && stalledProjects !== null
          ? (stalledProjects / totalProjects) * 100
          : null;
      return {
        id: c.id,
        label: c.label,
        governance: kpiValue(map, "ai_governance_score"),
        regulatory: kpiValue(map, "regulatory_readiness"),
        privacy: kpiValue(map, "data_privacy_compliance"),
        stalledRatio,
      };
    });
  }, [companies, perCompany]);

  // ── Spend vs return scatter ──
  const scatterData = useMemo(() => {
    return companies
      .map((c) => {
        const map = perCompany[c.id] ?? {};
        return {
          id: c.id,
          label: c.label,
          spend: kpiValue(map, "total_ai_spend"),
          roi: kpiValue(map, "ai_roi"),
          maturity: kpiValue(map, "ai_maturity_score") ?? 1,
        };
      })
      .filter((d): d is { id: string; label: string; spend: number; roi: number; maturity: number } =>
        d.spend !== null && d.roi !== null,
      );
  }, [companies, perCompany]);

  const spendMedian = median(scatterData.map((d) => d.spend));
  const roiMedian = median(scatterData.map((d) => d.roi));

  const askInsights = (companyId: string, companyLabel: string, kpiIds: string[], question: string) =>
    setInsightsRequest({ companyId, companyLabel, period: DEFAULT_PERIOD, kpiIds, question });

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Executive Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Board-level view of value creation, portfolio risk, and AI spend efficiency. Click any row, cell, or point for an AI-generated brief.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span
              className={`w-2 h-2 rounded-full ${
                liveStatus === "live" ? "bg-emerald-500" : liveStatus === "loading" ? "bg-amber-400 animate-pulse" : "bg-rose-400"
              }`}
            />
            {liveStatus === "live" ? "Live data" : liveStatus === "loading" ? "Loading KPIs…" : "Unable to load KPI data"}
          </div>
        </div>

        {!isLoadingCompanies && companies.length === 0 && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> No companies returned by the API.
          </div>
        )}

        {/* Value-creation leaderboard */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-[13px] font-semibold text-slate-800">Value-Creation Leaderboard</span>
            <span className="text-[12px] text-slate-500">— ranked by AI ROI</span>
          </div>
          <div className="divide-y divide-slate-100">
            {leaderboard.map((row, i) => (
              <button
                key={row.id}
                onClick={() =>
                  askInsights(
                    row.id,
                    row.label,
                    ["ai_roi", "ebitda_uplift", "cost_savings"],
                    `How is ${row.label} performing on AI ROI, EBITDA uplift, and cost savings, and what's driving its portfolio rank?`,
                  )
                }
                className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="w-6 text-[13px] font-semibold text-slate-400 shrink-0">#{i + 1}</span>
                <span className="w-32 text-[13px] font-medium text-slate-900 shrink-0 truncate">{row.label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: row.roi !== null ? `${Math.max(4, (row.roi / maxRoi) * 100)}%` : "0%" }}
                  />
                </div>
                <span className="w-16 text-right text-[13px] font-mono text-slate-900 shrink-0">{fmtX(row.roi)}</span>
                <span className="w-20 text-right text-[12px] font-mono text-slate-500 shrink-0">{fmtMoney(row.ebitda)}</span>
                <span className="w-20 text-right text-[12px] font-mono text-slate-500 shrink-0">{fmtMoney(row.costSavings)}</span>
              </button>
            ))}
            {leaderboard.length === 0 && !isLoadingKpis && (
              <div className="px-5 py-6 text-center text-[12px] text-slate-400">No KPI data available.</div>
            )}
          </div>
          <div className="flex items-center gap-4 px-5 py-2.5 border-t border-slate-100 text-[11px] font-medium text-slate-500">
            <span className="ml-[168px]">AI ROI</span>
            <span className="ml-auto flex gap-4">
              <span className="w-20 text-right">EBITDA Uplift</span>
              <span className="w-20 text-right">Cost Savings</span>
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Risk & governance heatmap */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <span className="text-[13px] font-semibold text-slate-800">Risk &amp; Governance Heatmap</span>
            </div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="text-left font-semibold px-2 py-2">Company</th>
                    {RISK_DIMENSIONS.map((d) => (
                      <th key={d.key} className="text-center font-semibold px-2 py-2">{d.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riskRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-2 py-2 font-medium text-slate-800 truncate max-w-[110px]">{row.label}</td>
                      {RISK_DIMENSIONS.map((d) => {
                        const value = d.key === "stalled" ? row.stalledRatio : (row as any)[d.key];
                        const level = d.key === "stalled" ? inverseLevel(value) : scoreLevel(value);
                        return (
                          <td key={d.key} className="px-2 py-2 text-center">
                            <button
                              onClick={() =>
                                askInsights(
                                  row.id,
                                  row.label,
                                  [d.kpiId, "ai_governance_score", "regulatory_readiness"],
                                  `What's driving ${row.label}'s ${d.label.toLowerCase()} standing, and what should we watch?`,
                                )
                              }
                              className={`inline-flex h-6 w-14 items-center justify-center rounded-md border text-[11px] font-mono hover:opacity-80 transition-opacity ${RISK_STYLES[level]}`}
                            >
                              {value === null ? "—" : d.key === "stalled" ? fmtPct(value) : Math.round(value)}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {riskRows.length === 0 && !isLoadingKpis && (
                    <tr>
                      <td colSpan={RISK_DIMENSIONS.length + 1} className="px-2 py-6 text-center text-slate-500">
                        No KPI data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-2.5 border-t border-slate-100 text-[11px] text-slate-500">
              Green = healthy · Amber = watch · Red = at risk. Stalled Projects shown as % of total (lower is better).
            </div>
          </div>

          {/* Spend vs return frontier */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span className="text-[13px] font-semibold text-slate-800">AI Spend vs. Return</span>
            </div>
            <div className="p-4 h-72">
              {scatterData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[12px] text-slate-400">
                  {isLoadingKpis ? "Loading…" : "No spend/ROI data available."}
                </div>
              ) : (
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      dataKey="spend"
                      name="Total AI Spend"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(v) => fmtMoney(v)}
                    />
                    <YAxis type="number" dataKey="roi" name="AI ROI" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}x`} />
                    <ZAxis type="number" dataKey="maturity" range={[60, 300]} name="AI Maturity" />
                    <ReferenceLine x={spendMedian} stroke="#cbd5e1" strokeDasharray="4 4" />
                    <ReferenceLine y={roiMedian} stroke="#cbd5e1" strokeDasharray="4 4" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number, name: string) => (name === "Total AI Spend" ? fmtMoney(value) : name === "AI ROI" ? fmtX(value) : value)}
                      labelFormatter={() => ""}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as (typeof scatterData)[number];
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-sm">
                            <div className="font-semibold text-slate-800">{d.label}</div>
                            <div className="text-slate-500">Spend: {fmtMoney(d.spend)}</div>
                            <div className="text-slate-500">ROI: {fmtX(d.roi)}</div>
                          </div>
                        );
                      }}
                    />
                    <Scatter
                      data={scatterData}
                      fill="#6366f1"
                      cursor="pointer"
                      onClick={(d: any) =>
                        askInsights(
                          d.id,
                          d.label,
                          ["total_ai_spend", "ai_roi", "ai_maturity_score"],
                          `Is ${d.label} getting an efficient return on its AI spend relative to the rest of the portfolio?`,
                        )
                      }
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="px-5 py-2.5 border-t border-slate-100 text-[11px] text-slate-500">
              Dashed lines mark portfolio medians. Bubble size = AI Maturity Score. Click a point for a brief.
            </div>
          </div>
        </div>
      </div>

      <InsightsDrawer request={insightsRequest} onClose={() => setInsightsRequest(null)} />
    </div>
  );
}
