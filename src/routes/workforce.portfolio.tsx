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
import { useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce/portfolio")({
  component: PortfolioOverview,
});

type Row = {
  company: string;
  employees: number;
  adoption: number;
  readiness: number;
  productivity: number;
  attrition: number;
  engagement: number;
  risk: number;
  ebitda: number;
};

// NOTE: employees/readiness/productivity/attrition/engagement/risk have no
// backend source (this KPI system has no HR/workforce data) — these stay
// illustrative. Only the company identities are real; adoption/ebitda are
// loosely modeled on real portfolio_ai_adoption_score / ebitda_uplift scale.
const ROWS: Row[] = [
  { company: "Provation", employees: 6240, adoption: 58, readiness: 81, productivity: 18, attrition: 9.2, engagement: 82, risk: 28, ebitda: 6.4 },
  { company: "Fluke", employees: 5180, adoption: 68, readiness: 84, productivity: 23, attrition: 8.1, engagement: 85, risk: 22, ebitda: 7.9 },
  { company: "Gordian", employees: 4310, adoption: 49, readiness: 71, productivity: 14, attrition: 10.4, engagement: 76, risk: 35, ebitda: 4.8 },
  { company: "Novamind", employees: 5520, adoption: 41, readiness: 64, productivity: 9, attrition: 18.7, engagement: 68, risk: 62, ebitda: 2.1 },
];

const COLUMNS: { key: keyof Row; label: string; fmt?: (v: number) => string }[] = [
  { key: "company", label: "Company" },
  { key: "employees", label: "Employees", fmt: (v) => v.toLocaleString() },
  { key: "adoption", label: "AI Adoption", fmt: (v) => `${v}%` },
  { key: "readiness", label: "Readiness", fmt: (v) => `${v}` },
  { key: "productivity", label: "Productivity", fmt: (v) => `+${v}%` },
  { key: "attrition", label: "Attrition", fmt: (v) => `${v}%` },
  { key: "engagement", label: "Engagement", fmt: (v) => `${v}` },
  { key: "risk", label: "Risk", fmt: (v) => `${v}` },
  { key: "ebitda", label: "EBITDA Δ", fmt: (v) => `+${v}%` },
];

const BENCH = [
  { cat: "Adoption", top: 70, median: 50, bottom: 32 },
  { cat: "Productivity", top: 22, median: 14, bottom: 6 },
  { cat: "Engagement", top: 85, median: 76, bottom: 68 },
  { cat: "Retention", top: 92, median: 87, bottom: 81 },
  { cat: "AI Maturity", top: 84, median: 71, bottom: 54 },
  { cat: "Value Creation", top: 8.0, median: 4.8, bottom: 1.8 },
];

function PortfolioOverview() {
  const { companyLabel } = useWorkforce();
  const [sortKey, setSortKey] = useState<keyof Row>("ebitda");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const arr = [...ROWS];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" || typeof bv === "string") {
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [sortKey, sortDir]);

  const averages = useMemo(() => {
    const n = ROWS.length;
    return {
      employees: Math.round(ROWS.reduce((s, r) => s + r.employees, 0) / n),
      adoption: Math.round(ROWS.reduce((s, r) => s + r.adoption, 0) / n),
      readiness: Math.round(ROWS.reduce((s, r) => s + r.readiness, 0) / n),
      productivity: Math.round(ROWS.reduce((s, r) => s + r.productivity, 0) / n),
      attrition: +(ROWS.reduce((s, r) => s + r.attrition, 0) / n).toFixed(1),
      engagement: Math.round(ROWS.reduce((s, r) => s + r.engagement, 0) / n),
      risk: Math.round(ROWS.reduce((s, r) => s + r.risk, 0) / n),
      ebitda: +(ROWS.reduce((s, r) => s + r.ebitda, 0) / n).toFixed(1),
    };
  }, []);

  const toggleSort = (k: keyof Row) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const rankingData = [...ROWS]
    .sort((a, b) => b.ebitda - a.ebitda)
    .map((r) => ({ name: r.company.replace("Company ", "Co. "), value: r.ebitda }));

  const adoptionData = ROWS.map((r) => ({
    name: r.company.replace("Company ", "Co. "),
    value: r.adoption,
  }));

  const valueData = ROWS.map((r) => ({
    name: r.company.replace("Company ", "Co. "),
    productivity: r.productivity,
    ebitda: r.ebitda,
  }));

  const PIE_COLORS = [COLORS.indigo, COLORS.teal, COLORS.green, COLORS.amber, COLORS.red];

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
          Portfolio Overview
        </h1>
      </div>

      <GlassPanel
        title="Portfolio Comparison Matrix"
        description="Sort any column. Portfolio averages shown at the bottom."
        action={<Pill label={`${ROWS.length} Companies`} tone="indigo" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="text-left py-2 pr-3">#</th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className={`py-2 pr-3 select-none cursor-pointer hover:text-slate-900 ${
                      c.key === "company" ? "text-left" : "text-right"
                    }`}
                    onClick={() => toggleSort(c.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      <ArrowUpDown
                        className="w-3 h-3 opacity-50"
                        style={{ color: sortKey === c.key ? COLORS.indigo : undefined }}
                      />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr
                  key={r.company}
                  className="border-b border-slate-200 hover:bg-slate-50"
                >
                  <td className="py-2.5 pr-3">
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-semibold"
                      style={{
                        backgroundColor: i === 0 ? `${COLORS.amber}22` : "#e2e8f0",
                        color: i === 0 ? COLORS.amber : "#94a3b8",
                      }}
                    >
                      {i === 0 ? <Trophy className="w-3 h-3" /> : i + 1}
                    </span>
                  </td>
                  {COLUMNS.map((c) => {
                    const v = r[c.key];
                    const isCompany = c.key === "company";
                    return (
                      <td
                        key={c.key}
                        className={`py-2.5 pr-3 ${isCompany ? "text-left text-slate-900" : "text-right text-slate-200"}`}
                      >
                        {c.fmt ? c.fmt(v as number) : v}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr style={{ backgroundColor: "rgba(99,102,241,0.06)" }}>
                <td className="py-2.5 pr-3 text-[10px] uppercase tracking-wider text-slate-600">
                  Avg
                </td>
                <td className="py-2.5 pr-3 text-left text-slate-700">Portfolio Average</td>
                <td className="py-2.5 pr-3 text-right text-slate-200">
                  {averages.employees.toLocaleString()}
                </td>
                <td className="py-2.5 pr-3 text-right text-slate-200">{averages.adoption}%</td>
                <td className="py-2.5 pr-3 text-right text-slate-200">{averages.readiness}</td>
                <td className="py-2.5 pr-3 text-right text-slate-200">+{averages.productivity}%</td>
                <td className="py-2.5 pr-3 text-right text-slate-200">{averages.attrition}%</td>
                <td className="py-2.5 pr-3 text-right text-slate-200">{averages.engagement}</td>
                <td className="py-2.5 pr-3 text-right text-slate-200">{averages.risk}</td>
                <td className="py-2.5 pr-3 text-right" style={{ color: COLORS.green }}>
                  +{averages.ebitda}%
                </td>
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
            <div
              key={b.cat}
              className="rounded-xl border border-slate-200 p-4"
              style={{ backgroundColor: "#f8fafc" }}
            >
              <div className="text-[12px] text-slate-700 font-medium">{b.cat}</div>
              <div className="mt-3 space-y-2">
                <Bench label="Top Quartile" value={b.top} color={COLORS.green} max={b.top} />
                <Bench label="Median" value={b.median} color={COLORS.teal} max={b.top} />
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
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {rankingData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Adoption Distribution" description="Share of AI-enabled workforce">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Pie
                  data={adoptionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {adoptionData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                />
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Bar dataKey="productivity" name="Productivity %" fill={COLORS.indigo} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ebitda" name="EBITDA %" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function Bench({
  label,
  value,
  color,
  max,
}: {
  label: string;
  value: number;
  color: string;
  max: number;
}) {
  const pct = Math.max(4, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-slate-600">{label}</span>
        <span style={{ color }} className="font-medium">
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
