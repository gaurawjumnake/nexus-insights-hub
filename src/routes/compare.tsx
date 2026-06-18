import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { usePortfolioKpis } from "@/hooks/usePortfolioKpis";
import { kpi as kpiOf, kpiValue } from "@/lib/normaliseKpi";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Portfolio Comparison — Nexus" },
      {
        name: "description",
        content:
          "Side-by-side KPI comparison across portfolio companies, sourced from the live KPI pipeline.",
      },
    ],
  }),
  component: ComparePage,
});

// ─── KPI catalog per persona ────────────────────────────────────────────────

type KpiRow = {
  id: string;
  label: string;
  category?: string;
  /** Lower is better → invert benchmarking color logic */
  lowerIsBetter?: boolean;
};

type PersonaKey = "cxo" | "business" | "technology" | "operations";

const PERSONAS: { key: PersonaKey; label: string; accent: string }[] = [
  { key: "cxo", label: "CXO", accent: "bg-indigo-500" },
  { key: "business", label: "Business", accent: "bg-teal-500" },
  { key: "technology", label: "Technology", accent: "bg-violet-500" },
  { key: "operations", label: "Operations", accent: "bg-amber-500" },
];

const KPIS: Record<PersonaKey, KpiRow[]> = {
  cxo: [
    { id: "ai_revenue", label: "AI Revenue", category: "Value" },
    { id: "ebitda_uplift", label: "EBITDA Uplift", category: "Value" },
    { id: "ai_roi", label: "AI ROI", category: "Value" },
    { id: "cost_savings", label: "Cost Savings", category: "Value" },
    { id: "ai_maturity_score", label: "AI Maturity Score", category: "Maturity" },
    { id: "portfolio_ai_adoption_score", label: "AI Adoption Score", category: "Maturity" },
    { id: "ai_governance_score", label: "Governance Score", category: "Risk" },
    { id: "regulatory_readiness", label: "Regulatory Readiness", category: "Risk" },
    { id: "total_ai_spend", label: "Total AI Spend", category: "Cost", lowerIsBetter: true },
  ],
  business: [
    { id: "direct_ai_revenue", label: "Direct AI Revenue", category: "Revenue" },
    { id: "ai_assisted_revenue", label: "AI-Assisted Revenue", category: "Revenue" },
    { id: "pipeline_influenced_revenue", label: "Pipeline Influenced", category: "Revenue" },
    { id: "cross_sell_uplift", label: "Cross-Sell Uplift", category: "Revenue" },
    { id: "productivity_gain", label: "Productivity Gain", category: "Efficiency" },
    { id: "cost_per_outcome", label: "Cost per Outcome", category: "Efficiency", lowerIsBetter: true },
    { id: "top_quartile_position", label: "Top-Quartile Position", category: "Benchmark" },
    { id: "industry_benchmark_ratio", label: "Industry Benchmark", category: "Benchmark" },
  ],
  technology: [
    { id: "availability_uptime", label: "Platform Uptime", category: "Platform" },
    { id: "api_success_rate", label: "API Success Rate", category: "Platform" },
    { id: "error_rate", label: "Error Rate", category: "Platform", lowerIsBetter: true },
    { id: "fallback_rate", label: "Model Fallback Rate", category: "Models", lowerIsBetter: true },
    { id: "percent_ai_in_production", label: "% AI in Production", category: "Models" },
    { id: "production_ratio", label: "Prod/POC Ratio", category: "Models" },
    { id: "cloud_spend", label: "Cloud Spend", category: "FinOps", lowerIsBetter: true },
    { id: "api_licensing_spend", label: "API & Licensing", category: "FinOps", lowerIsBetter: true },
    { id: "technical_maturity_score", label: "Tech Maturity", category: "Maturity" },
    { id: "data_privacy_compliance", label: "Data Privacy", category: "Risk" },
  ],
  operations: [
    { id: "total_ai_projects", label: "Total AI Projects" },
    { id: "projects_in_production", label: "In Production" },
    { id: "projects_in_poc", label: "In POC" },
    { id: "stalled_projects", label: "Stalled Projects", lowerIsBetter: true },
    { id: "adoption_yoy_growth", label: "Adoption YoY Growth" },
    { id: "active_ai_users", label: "Active AI Users" },
    { id: "copilot_adoption", label: "Copilot Adoption" },
    { id: "budget_adherence", label: "Budget Adherence" },
    { id: "budget_variance", label: "Budget Variance", lowerIsBetter: true },
    { id: "human_review_coverage", label: "Human Review Coverage" },
    { id: "policy_compliance_rate", label: "Policy Compliance" },
  ],
};

// ─── Page ────────────────────────────────────────────────────────────────────

function ComparePage() {
  const [active, setActive] = useState<PersonaKey>("cxo");
  const { companies, perCompany, isLoadingCompanies, isLoadingKpis, error } =
    usePortfolioKpis();

  const rows = KPIS[active];

  const liveStatus = isLoadingCompanies || isLoadingKpis
    ? "loading"
    : error
      ? "offline"
      : "live";

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Portfolio KPI Comparison
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Side-by-side KPI snapshot across all portfolio companies, sourced
              live from the KPI pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span
              className={`w-2 h-2 rounded-full ${
                liveStatus === "live"
                  ? "bg-emerald-500"
                  : liveStatus === "loading"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-rose-400"
              }`}
            />
            {liveStatus === "live"
              ? "Live data"
              : liveStatus === "loading"
                ? "Loading KPIs…"
                : "Unable to load KPI data"}
          </div>
        </div>

        {/* Companies legend / loading */}
        {isLoadingCompanies ? (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-slate-200 bg-white animate-pulse"
              />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> No companies returned by the API.
          </div>
        ) : (
          <div
            className="grid gap-3 mb-5"
            style={{
              gridTemplateColumns: `repeat(${companies.length}, minmax(0,1fr))`,
            }}
          >
            {companies.map((pc) => (
              <div
                key={pc.id}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3"
              >
                <div className="text-[13px] font-semibold text-slate-900">
                  {pc.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {pc.sector ?? pc.id}
                </div>
              </div>
            ))}
          </div>
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
                  isActive
                    ? "border-teal-500 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
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
                  <th
                    key={pc.id}
                    className="text-right font-semibold px-5 py-3"
                  >
                    {pc.label}
                  </th>
                ))}
                {companies.length === 0 && (
                  <th className="text-right font-semibold px-5 py-3">—</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                // Find best / worst for color coding
                const values = companies
                  .map((c) => kpiValue(perCompany[c.id] ?? {}, row.id))
                  .filter((v): v is number => typeof v === "number");
                const best = values.length
                  ? row.lowerIsBetter
                    ? Math.min(...values)
                    : Math.max(...values)
                  : null;
                const worst = values.length
                  ? row.lowerIsBetter
                    ? Math.max(...values)
                    : Math.min(...values)
                  : null;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="text-[13px] font-medium text-slate-900">
                        {row.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="font-mono">{row.id}</span>
                        {row.category && (
                          <>
                            <span>·</span>
                            <span>{row.category}</span>
                          </>
                        )}
                      </div>
                    </td>
                    {companies.map((pc) => {
                      const map = perCompany[pc.id] ?? {};
                      const display = isLoadingKpis
                        ? null
                        : kpiOf(map, row.id, "—");
                      const num = kpiValue(map, row.id);
                      const color =
                        num !== null && best !== null && num === best && values.length > 1
                          ? "text-emerald-600"
                          : num !== null && worst !== null && num === worst && values.length > 1
                            ? "text-rose-600"
                            : "text-slate-900";
                      return (
                        <td
                          key={pc.id}
                          className={`px-5 py-3 text-right font-mono text-[14px] ${color}`}
                        >
                          {display === null ? (
                            <span className="inline-block h-4 w-14 animate-pulse rounded bg-slate-200 align-middle" />
                          ) : (
                            display
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-[11px] text-slate-400">
          Green = best in portfolio for this KPI · Red = worst. Cost-style KPIs
          (spend, error rate, variance) invert the scale — lower wins.
        </div>
      </div>
    </div>
  );
}
