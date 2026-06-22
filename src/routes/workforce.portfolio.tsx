import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpDown, Trophy } from "lucide-react";
import { COLORS, GlassPanel, Pill } from "@/components/workforce/ui";
import { usePortfolioKpis } from "@/hooks/usePortfolioKpis";
import { kpiValue } from "@/lib/normaliseKpi";

export const Route = createFileRoute("/workforce/portfolio")({
  component: PortfolioOverview,
});

// ─── Mock fallbacks per company (used when API returns null for a field) ──────

const MOCK_FALLBACK: Record<string, Record<string, number>> = {
  fluke:    { employees: 5180, readiness: 84, attrition: 8.1,  engagement: 85, risk: 22 },
  novamind: { employees: 5520, readiness: 64, attrition: 18.7, engagement: 68, risk: 62 },
};
const DEFAULT_MOCK = { employees: 4000, readiness: 75, attrition: 10.0, engagement: 78, risk: 30 };

function mockFallback(companyId: string, field: string): number {
  return MOCK_FALLBACK[companyId]?.[field] ?? DEFAULT_MOCK[field as keyof typeof DEFAULT_MOCK] ?? 0;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Row = {
  company: string;
  companyId: string;
  employees: number; employeesMock: boolean;
  adoption: number;  adoptionMock: boolean;
  readiness: number; readinessMock: boolean;
  productivity: number; productivityMock: boolean;
  attrition: number; attritionMock: boolean;
  engagement: number; engagementMock: boolean;
  risk: number;      riskMock: boolean;
  ebitda: number;    ebitdaMock: boolean;
};

type ColDef = {
  key: keyof Row;
  mockKey?: keyof Row;
  label: string;
  fmt?: (v: number) => string;
};

const COLUMNS: ColDef[] = [
  { key: "company",     label: "Company" },
  { key: "employees",   mockKey: "employeesMock",   label: "Employees",   fmt: (v) => v.toLocaleString() },
  { key: "adoption",    mockKey: "adoptionMock",    label: "AI Adoption", fmt: (v) => `${v.toFixed(0)}%` },
  { key: "readiness",   mockKey: "readinessMock",   label: "Readiness",   fmt: (v) => `${v.toFixed(0)}` },
  { key: "productivity",mockKey: "productivityMock",label: "Productivity",fmt: (v) => `+${v.toFixed(1)}%` },
  { key: "attrition",   mockKey: "attritionMock",   label: "Attrition",   fmt: (v) => `${v.toFixed(1)}%` },
  { key: "engagement",  mockKey: "engagementMock",  label: "Engagement",  fmt: (v) => `${v.toFixed(0)}` },
  { key: "risk",        mockKey: "riskMock",        label: "Risk",        fmt: (v) => `${v.toFixed(0)}` },
  { key: "ebitda",      mockKey: "ebitdaMock",      label: "EBITDA Δ",    fmt: (v) => `+${v.toFixed(1)}%` },
];

const BENCH = [
  { cat: "Adoption",      top: 70,  median: 50,  bottom: 32 },
  { cat: "Productivity",  top: 22,  median: 14,  bottom: 6 },
  { cat: "Engagement",    top: 85,  median: 76,  bottom: 68 },
  { cat: "Retention",     top: 92,  median: 87,  bottom: 81 },
  { cat: "AI Maturity",   top: 84,  median: 71,  bottom: 54 },
  { cat: "Value Creation",top: 8.0, median: 4.8, bottom: 1.8 },
];

const PIE_COLORS = [COLORS.indigo, COLORS.teal, COLORS.green, COLORS.amber, COLORS.red];

// ─── Component ────────────────────────────────────────────────────────────────

function PortfolioOverview() {
  const { companies, perCompany, isLoadingKpis } = usePortfolioKpis();
  const [sortKey, setSortKey] = useState<keyof Row>("ebitda");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo<Row[]>(() => {
    if (isLoadingKpis || companies.length === 0) return [];
    return companies.map((c) => {
      const k = perCompany[c.id] ?? {};

      const real = (kpiId: string) => kpiValue(k, kpiId);

      const adoptionVal  = real("portfolio_ai_adoption_score");
      const ebitdaVal    = real("ebitda_uplift");
      const productVal   = real("productivity_gain");

      return {
        company: c.label,
        companyId: c.id,
        employees:    mockFallback(c.id, "employees"), employeesMock: true,
        adoption:     adoptionVal  ?? (mockFallback(c.id, "adoption")     || 50),
        adoptionMock: adoptionVal === null,
        readiness:    mockFallback(c.id, "readiness"), readinessMock: true,
        productivity: productVal   ?? (mockFallback(c.id, "productivity") || 15),
        productivityMock: productVal === null,
        attrition:    mockFallback(c.id, "attrition"), attritionMock: true,
        engagement:   mockFallback(c.id, "engagement"),engagementMock: true,
        risk:         mockFallback(c.id, "risk"),       riskMock: true,
        ebitda:       ebitdaVal    ?? (mockFallback(c.id, "ebitda")       || 5),
        ebitdaMock:   ebitdaVal === null,
      };
    });
  }, [companies, perCompany, isLoadingKpis]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string" || typeof bv === "string")
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  const hasMock = rows.some((r) =>
    r.employeesMock || r.adoptionMock || r.readinessMock || r.productivityMock ||
    r.attritionMock || r.engagementMock || r.riskMock || r.ebitdaMock
  );

  const avgOf = (key: keyof Row) => {
    if (!rows.length) return 0;
    const nums = rows.map((r) => r[key] as number).filter(Number.isFinite);
    return nums.reduce((s, v) => s + v, 0) / nums.length;
  };

  const toggleSort = (k: keyof Row) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const rankingData = [...rows].sort((a, b) => b.ebitda - a.ebitda).map((r) => ({ name: r.company, value: +r.ebitda.toFixed(1) }));
  const adoptionData = rows.map((r) => ({ name: r.company, value: +r.adoption.toFixed(0) }));
  const valueData = rows.map((r) => ({ name: r.company, productivity: +r.productivity.toFixed(1), ebitda: +r.ebitda.toFixed(1) }));

  if (isLoadingKpis) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-slate-200" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.18em] text-slate-500 mb-1">WORKSPACE · PORTFOLIO OVERVIEW</div>
        <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Portfolio Overview
        </h1>
      </div>

      <GlassPanel
        title="Portfolio Comparison Matrix"
        description="Sort any column. ★ denotes estimated values."
        action={<Pill label={`${rows.length} Companies`} tone="indigo" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="text-left py-2 pr-3">#</th>
                {COLUMNS.map((c) => (
                  <th
                    key={String(c.key)}
                    className={`py-2 pr-3 select-none cursor-pointer hover:text-slate-900 ${c.key === "company" ? "text-left" : "text-right"}`}
                    onClick={() => toggleSort(c.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      <ArrowUpDown className="w-3 h-3 opacity-50" style={{ color: sortKey === c.key ? COLORS.indigo : undefined }} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r.companyId} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-2.5 pr-3">
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-semibold"
                      style={{ backgroundColor: i === 0 ? `${COLORS.amber}22` : "#e2e8f0", color: i === 0 ? COLORS.amber : "#94a3b8" }}
                    >
                      {i === 0 ? <Trophy className="w-3 h-3" /> : i + 1}
                    </span>
                  </td>
                  {COLUMNS.map((c) => {
                    const isCompany = c.key === "company";
                    const v = r[c.key] as number | string;
                    const isMock = c.mockKey ? (r[c.mockKey] as boolean) : false;
                    return (
                      <td
                        key={String(c.key)}
                        className={`py-2.5 pr-3 ${isCompany ? "text-left text-slate-900 font-medium" : "text-right text-slate-800"}`}
                      >
                        {isCompany ? v : (
                          <span>
                            {c.fmt ? c.fmt(v as number) : v}
                            {isMock && <sup className="ml-0.5 text-amber-500 text-[9px]">★</sup>}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr style={{ backgroundColor: "rgba(99,102,241,0.06)" }}>
                <td className="py-2.5 pr-3 text-[10px] uppercase tracking-wider text-slate-600">Avg</td>
                <td className="py-2.5 pr-3 text-left text-slate-700">Portfolio Average</td>
                <td className="py-2.5 pr-3 text-right text-slate-500">{Math.round(avgOf("employees")).toLocaleString()}<sup className="ml-0.5 text-amber-500 text-[9px]">★</sup></td>
                <td className="py-2.5 pr-3 text-right text-slate-500">{avgOf("adoption").toFixed(0)}%</td>
                <td className="py-2.5 pr-3 text-right text-slate-500">{avgOf("readiness").toFixed(0)}<sup className="ml-0.5 text-amber-500 text-[9px]">★</sup></td>
                <td className="py-2.5 pr-3 text-right text-slate-500">+{avgOf("productivity").toFixed(1)}%</td>
                <td className="py-2.5 pr-3 text-right text-slate-500">{avgOf("attrition").toFixed(1)}%<sup className="ml-0.5 text-amber-500 text-[9px]">★</sup></td>
                <td className="py-2.5 pr-3 text-right text-slate-500">{avgOf("engagement").toFixed(0)}<sup className="ml-0.5 text-amber-500 text-[9px]">★</sup></td>
                <td className="py-2.5 pr-3 text-right text-slate-500">{avgOf("risk").toFixed(0)}<sup className="ml-0.5 text-amber-500 text-[9px]">★</sup></td>
                <td className="py-2.5 pr-3 text-right" style={{ color: COLORS.green }}>+{avgOf("ebitda").toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassPanel>

      <GlassPanel
        title="Benchmarking"
        description="Top quartile · Median · Bottom quartile across key dimensions"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BENCH.map((b) => (
            <div key={b.cat} className="rounded-xl border border-slate-200 p-4" style={{ backgroundColor: "#f8fafc" }}>
              <div className="text-[12px] text-slate-700 font-medium">{b.cat}</div>
              <div className="mt-3 space-y-2">
                <Bench label="Top Quartile"    value={b.top}    color={COLORS.green} max={b.top} />
                <Bench label="Median"          value={b.median} color={COLORS.teal}  max={b.top} />
                <Bench label="Bottom Quartile" value={b.bottom} color={COLORS.amber} max={b.top} />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <div className="grid xl:grid-cols-3 gap-6">
        <GlassPanel title="Portfolio Ranking" description="By EBITDA impact (%)">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={rankingData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={70} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {rankingData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Adoption Distribution" description="Share of AI-enabled workforce">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Pie data={adoptionData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {adoptionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Value Creation" description="Productivity vs EBITDA contribution">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={valueData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Bar dataKey="productivity" name="Productivity %" fill={COLORS.indigo} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ebitda"       name="EBITDA %"       fill={COLORS.teal}   radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {hasMock && (
        <p className="text-[11px] text-slate-400 text-center pb-2">
          <sup className="text-amber-500 mr-0.5">★</sup>
          Estimated value — not yet reported by the KPI pipeline. Replace with real data once available.
        </p>
      )}
    </div>
  );
}

function Bench({ label, value, color, max }: { label: string; value: number; color: string; max: number }) {
  const pct = Math.max(4, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-slate-600">{label}</span>
        <span style={{ color }} className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
