import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useKpis } from "@/hooks/useKpis";
import { kpi as kpiOf } from "@/lib/normaliseKpi";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Portfolio Comparison — Nexus" },
      {
        name: "description",
        content:
          "Side-by-side KPI comparison across Gordian, Provation, and Fluke portfolio companies.",
      },
    ],
  }),
  component: ComparePage,
});

// ─── Portcos ─────────────────────────────────────────────────────────────────

const PORTCOS = [
  { id: "gordian", label: "Gordian", sector: "Construction Cost Data" },
  { id: "provation", label: "Provation", sector: "Healthcare SaaS" },
  { id: "fluke", label: "Fluke", sector: "Industrial Test & Measure" },
] as const;

const PERIOD = "2025-2026";

// ─── KPI catalog per persona ────────────────────────────────────────────────
// Each entry: kpi_id (matches backend), label, unit hint, and sample values
// per portco used as fallback when API isn't live.

type KpiRow = {
  id: string;
  label: string;
  category?: string;
  samples: Record<string, string>; // portco id -> display
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
    { id: "ai_revenue", label: "AI Revenue", category: "Value",
      samples: { gordian: "$18.4M", provation: "$24.1M", fluke: "$31.7M" } },
    { id: "ebitda_uplift", label: "EBITDA Uplift", category: "Value",
      samples: { gordian: "6.2%", provation: "8.1%", fluke: "5.4%" } },
    { id: "ai_roi", label: "AI ROI", category: "Value",
      samples: { gordian: "2.40x", provation: "3.10x", fluke: "2.80x" } },
    { id: "cost_savings", label: "Cost Savings", category: "Value",
      samples: { gordian: "$4.2M", provation: "$6.8M", fluke: "$9.1M" } },
    { id: "ai_maturity_score", label: "AI Maturity Score", category: "Maturity",
      samples: { gordian: "3.2/5", provation: "3.8/5", fluke: "4.1/5" } },
    { id: "portfolio_ai_adoption_score", label: "AI Adoption Score", category: "Maturity",
      samples: { gordian: "62/100", provation: "74/100", fluke: "81/100" } },
    { id: "ai_governance_score", label: "Governance Score", category: "Risk",
      samples: { gordian: "71/100", provation: "84/100", fluke: "78/100" } },
    { id: "regulatory_readiness", label: "Regulatory Readiness", category: "Risk",
      samples: { gordian: "82.0%", provation: "94.0%", fluke: "88.0%" } },
  ],
  business: [
    { id: "direct_ai_revenue", label: "Direct AI Revenue", category: "Revenue",
      samples: { gordian: "$11.2M", provation: "$15.6M", fluke: "$20.4M" } },
    { id: "ai_assisted_revenue", label: "AI-Assisted Revenue", category: "Revenue",
      samples: { gordian: "$7.2M", provation: "$8.5M", fluke: "$11.3M" } },
    { id: "pipeline_influenced_revenue", label: "Pipeline Influenced", category: "Revenue",
      samples: { gordian: "$22.0M", provation: "$31.0M", fluke: "$44.0M" } },
    { id: "cross_sell_uplift", label: "Cross-Sell Uplift", category: "Revenue",
      samples: { gordian: "$1.8M", provation: "$2.6M", fluke: "$3.9M" } },
    { id: "productivity_gain", label: "Productivity Gain", category: "Efficiency",
      samples: { gordian: "14.0%", provation: "19.0%", fluke: "22.0%" } },
    { id: "cost_per_outcome", label: "Cost per Outcome", category: "Efficiency",
      samples: { gordian: "$420", provation: "$310", fluke: "$280" } },
    { id: "top_quartile_position", label: "Top-Quartile Position", category: "Benchmark",
      samples: { gordian: "58/100", provation: "76/100", fluke: "82/100" } },
    { id: "industry_benchmark_ratio", label: "Industry Benchmark", category: "Benchmark",
      samples: { gordian: "1.10x", provation: "1.35x", fluke: "1.48x" } },
  ],
  technology: [
    { id: "availability_uptime", label: "Platform Uptime", category: "Platform",
      samples: { gordian: "99.2%", provation: "99.7%", fluke: "99.9%" } },
    { id: "api_success_rate", label: "API Success Rate", category: "Platform",
      samples: { gordian: "97.8%", provation: "99.1%", fluke: "99.4%" } },
    { id: "error_rate", label: "Error Rate", category: "Platform",
      samples: { gordian: "2.20%", provation: "0.90%", fluke: "0.60%" } },
    { id: "fallback_rate", label: "Model Fallback Rate", category: "Models",
      samples: { gordian: "4.10%", provation: "2.30%", fluke: "1.80%" } },
    { id: "percent_ai_in_production", label: "% AI in Production", category: "Models",
      samples: { gordian: "48.0%", provation: "64.0%", fluke: "72.0%" } },
    { id: "production_ratio", label: "Prod/POC Ratio", category: "Models",
      samples: { gordian: "0.92x", provation: "1.40x", fluke: "1.80x" } },
    { id: "cloud_spend", label: "Cloud Spend", category: "FinOps",
      samples: { gordian: "$2.1M", provation: "$3.4M", fluke: "$4.8M" } },
    { id: "api_licensing_spend", label: "API & Licensing", category: "FinOps",
      samples: { gordian: "$680K", provation: "$1.1M", fluke: "$1.6M" } },
    { id: "technical_maturity_score", label: "Tech Maturity", category: "Maturity",
      samples: { gordian: "3.1/5", provation: "3.9/5", fluke: "4.2/5" } },
    { id: "data_privacy_compliance", label: "Data Privacy", category: "Risk",
      samples: { gordian: "88.0%", provation: "96.0%", fluke: "92.0%" } },
  ],
  operations: [
    { id: "total_ai_projects", label: "Total AI Projects",
      samples: { gordian: "18", provation: "26", fluke: "34" } },
    { id: "projects_in_production", label: "In Production",
      samples: { gordian: "9", provation: "17", fluke: "24" } },
    { id: "projects_in_poc", label: "In POC",
      samples: { gordian: "6", provation: "7", fluke: "8" } },
    { id: "stalled_projects", label: "Stalled Projects",
      samples: { gordian: "3", provation: "2", fluke: "2" } },
    { id: "adoption_yoy_growth", label: "Adoption YoY Growth",
      samples: { gordian: "28.0%", provation: "41.0%", fluke: "52.0%" } },
    { id: "active_ai_users", label: "Active AI Users",
      samples: { gordian: "412", provation: "780", fluke: "1240" } },
    { id: "copilot_adoption", label: "Copilot Adoption",
      samples: { gordian: "280", provation: "540", fluke: "910" } },
    { id: "budget_adherence", label: "Budget Adherence",
      samples: { gordian: "92.0%", provation: "97.0%", fluke: "95.0%" } },
    { id: "budget_variance", label: "Budget Variance",
      samples: { gordian: "$210K", provation: "$80K", fluke: "$140K" } },
    { id: "human_review_coverage", label: "Human Review Coverage",
      samples: { gordian: "74.0%", provation: "88.0%", fluke: "82.0%" } },
    { id: "policy_compliance_rate", label: "Policy Compliance",
      samples: { gordian: "86.0%", provation: "95.0%", fluke: "91.0%" } },
  ],
};

// ─── Page ────────────────────────────────────────────────────────────────────

function ComparePage() {
  const [active, setActive] = useState<PersonaKey>("cxo");

  // Pull live KPIs for each portco; falls back to sample data per row when
  // a particular kpi_id isn't present in the response.
  const g = useKpis(PORTCOS[0].id, PERIOD);
  const p = useKpis(PORTCOS[1].id, PERIOD);
  const f = useKpis(PORTCOS[2].id, PERIOD);
  const maps: Record<string, ReturnType<typeof useKpis>["kpis"]> = {
    gordian: g.kpis,
    provation: p.kpis,
    fluke: f.kpis,
  };
  const liveStatus =
    g.isLoading || p.isLoading || f.isLoading
      ? "loading"
      : g.error || p.error || f.error
        ? "offline"
        : "live";

  const rows = KPIS[active];

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
              Side-by-side KPI snapshot across all portfolio companies for the{" "}
              <span className="font-mono">{PERIOD}</span> period.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span
              className={`w-2 h-2 rounded-full ${
                liveStatus === "live"
                  ? "bg-emerald-500"
                  : liveStatus === "loading"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-slate-300"
              }`}
            />
            {liveStatus === "live"
              ? "Live data"
              : liveStatus === "loading"
                ? "Loading…"
                : "Sample data (API offline)"}
          </div>
        </div>

        {/* PortCo legend */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {PORTCOS.map((pc) => (
            <div
              key={pc.id}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3"
            >
              <div className="text-[13px] font-semibold text-slate-900">{pc.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{pc.sector}</div>
            </div>
          ))}
        </div>

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
                <th className="text-left font-semibold px-5 py-3 w-[34%]">KPI</th>
                {PORTCOS.map((pc) => (
                  <th
                    key={pc.id}
                    className="text-right font-semibold px-5 py-3 w-[22%]"
                  >
                    {pc.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
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
                  {PORTCOS.map((pc) => {
                    const live = kpiOf(maps[pc.id], row.id, "");
                    const display = live && live !== "—" ? live : row.samples[pc.id];
                    const isLive = !!live && live !== "—";
                    return (
                      <td
                        key={pc.id}
                        className="px-5 py-3 text-right font-mono text-[14px] text-slate-900"
                      >
                        <span>{display}</span>
                        {isLive && (
                          <span
                            className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 align-middle"
                            title="Live value"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-[11px] text-slate-400">
          Green dot indicates a live value from the KPI pipeline; grey values
          are illustrative samples until the API has been calculated for that
          PortCo + period.
        </div>
      </div>
    </div>
  );
}
