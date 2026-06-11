import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Home, Users, Sparkles, Gauge, ShieldAlert, HeartHandshake, Search } from "lucide-react";
import { COLORS, GlassPanel, Pill } from "@/components/workforce/ui";
import { useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce/workforce-drilldown")({
  component: DrillDownPage,
});

type Node = {
  id: string;
  name: string;
  level: "Portfolio" | "Company" | "Business Unit" | "Department" | "Team";
  headcount: number;
  skills: number; // index 0-100
  adoption: number; // %
  productivity: number; // %
  risk: number; // 0-100
  engagement: number; // %
  children?: Node[];
};

const TREE: Node = {
  id: "p",
  name: "Portfolio",
  level: "Portfolio",
  headcount: 24830, skills: 71, adoption: 50, productivity: 17, risk: 39, engagement: 78,
  children: [
    {
      id: "a", name: "Company A", level: "Company",
      headcount: 6240, skills: 78, adoption: 58, productivity: 18, risk: 28, engagement: 82,
      children: [
        {
          id: "a-eng", name: "Engineering", level: "Business Unit",
          headcount: 1820, skills: 82, adoption: 71, productivity: 24, risk: 32, engagement: 79,
          children: [
            { id: "a-eng-pl", name: "Platform", level: "Department", headcount: 640, skills: 86, adoption: 78, productivity: 28, risk: 26, engagement: 81,
              children: [
                { id: "a-eng-pl-core", name: "Core Services Team", level: "Team", headcount: 42, skills: 88, adoption: 84, productivity: 31, risk: 22, engagement: 84 },
                { id: "a-eng-pl-data", name: "Data Platform Team", level: "Team", headcount: 38, skills: 84, adoption: 76, productivity: 26, risk: 28, engagement: 80 },
              ]},
            { id: "a-eng-ml", name: "ML / AI", level: "Department", headcount: 312, skills: 91, adoption: 88, productivity: 34, risk: 24, engagement: 86 },
            { id: "a-eng-app", name: "Applications", level: "Department", headcount: 868, skills: 75, adoption: 62, productivity: 19, risk: 38, engagement: 76 },
          ],
        },
        { id: "a-rev", name: "Revenue Ops", level: "Business Unit", headcount: 980, skills: 68, adoption: 49, productivity: 12, risk: 34, engagement: 78 },
        { id: "a-cust", name: "Customer Success", level: "Business Unit", headcount: 1240, skills: 64, adoption: 41, productivity: 9, risk: 36, engagement: 80 },
      ],
    },
    {
      id: "b", name: "Company B", level: "Company",
      headcount: 5180, skills: 81, adoption: 68, productivity: 23, risk: 22, engagement: 85,
      children: [
        { id: "b-eng", name: "Engineering", level: "Business Unit", headcount: 1620, skills: 85, adoption: 79, productivity: 28, risk: 20, engagement: 87 },
        { id: "b-ss", name: "Shared Services", level: "Business Unit", headcount: 1180, skills: 74, adoption: 71, productivity: 31, risk: 18, engagement: 83 },
      ],
    },
    { id: "c", name: "Company C", level: "Company", headcount: 4310, skills: 69, adoption: 49, productivity: 14, risk: 35, engagement: 76 },
    {
      id: "d", name: "Company D", level: "Company",
      headcount: 5520, skills: 62, adoption: 41, productivity: 9, risk: 62, engagement: 68,
      children: [
        { id: "d-eng", name: "Engineering", level: "Business Unit", headcount: 1340, skills: 68, adoption: 48, productivity: 12, risk: 71, engagement: 64 },
        { id: "d-rev", name: "Revenue Ops", level: "Business Unit", headcount: 920, skills: 58, adoption: 38, productivity: 7, risk: 68, engagement: 66 },
      ],
    },
    { id: "e", name: "Company E", level: "Company", headcount: 3580, skills: 54, adoption: 32, productivity: 6, risk: 48, engagement: 71 },
  ],
};

function findPath(root: Node, id: string, path: Node[] = [root]): Node[] | null {
  if (root.id === id) return path;
  for (const c of root.children ?? []) {
    const r = findPath(c, id, [...path, c]);
    if (r) return r;
  }
  return null;
}

function riskTone(v: number) {
  if (v >= 60) return COLORS.red;
  if (v >= 40) return COLORS.amber;
  if (v >= 25) return COLORS.teal;
  return COLORS.green;
}

function DrillDownPage() {
  const { companyLabel } = useWorkforce();
  const [currentId, setCurrentId] = useState<string>("p");
  const [query, setQuery] = useState("");

  const path = useMemo(() => findPath(TREE, currentId) ?? [TREE], [currentId]);
  const current = path[path.length - 1];

  const children = useMemo(() => {
    const list = current.children ?? [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(q));
  }, [current, query]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.18em] text-slate-500 mb-1">
          WORKSPACE · {companyLabel.toUpperCase()}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Workforce Drill Down
        </h1>
      </div>

      <GlassPanel
        title="Hierarchy"
        description="Click a row to drill in. Use breadcrumbs to navigate back."
        action={
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter children…"
              className="bg-transparent text-[12px] text-slate-900 placeholder:text-slate-400 outline-none w-40"
            />
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-1 text-[12px] mb-4">
          {path.map((n, i) => {
            const isLast = i === path.length - 1;
            return (
              <span key={n.id} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                <button
                  onClick={() => setCurrentId(n.id)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${
                    isLast ? "text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  style={isLast ? { backgroundColor: "rgba(99,102,241,0.15)" } : undefined}
                >
                  {i === 0 && <Home className="w-3 h-3" />}
                  {n.name}
                </button>
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
          <Stat label="Headcount" value={current.headcount.toLocaleString()} icon={<Users className="w-3.5 h-3.5" />} color={COLORS.indigo} />
          <Stat label="Skills Index" value={`${current.skills}`} icon={<Sparkles className="w-3.5 h-3.5" />} color={COLORS.teal} />
          <Stat label="AI Adoption" value={`${current.adoption}%`} icon={<Sparkles className="w-3.5 h-3.5" />} color={COLORS.green} />
          <Stat label="Productivity" value={`+${current.productivity}%`} icon={<Gauge className="w-3.5 h-3.5" />} color={COLORS.indigo} />
          <Stat label="Risk Score" value={`${current.risk}`} icon={<ShieldAlert className="w-3.5 h-3.5" />} color={riskTone(current.risk)} />
          <Stat label="Engagement" value={`${current.engagement}%`} icon={<HeartHandshake className="w-3.5 h-3.5" />} color={COLORS.amber} />
        </div>

        {children.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="text-left py-2 pr-3">Name</th>
                  <th className="text-left py-2 pr-3">Level</th>
                  <th className="text-right py-2 pr-3">Headcount</th>
                  <th className="text-right py-2 pr-3">Skills</th>
                  <th className="text-right py-2 pr-3">Adoption</th>
                  <th className="text-right py-2 pr-3">Productivity</th>
                  <th className="text-right py-2 pr-3">Risk</th>
                  <th className="text-right py-2">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {children.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setCurrentId(c.id)}
                    className="border-b border-slate-200 last:border-0 hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="py-2.5 pr-3 text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        {c.name}
                        {c.children && c.children.length > 0 && (
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Pill label={c.level} tone="indigo" />
                    </td>
                    <td className="py-2.5 pr-3 text-right text-slate-200">{c.headcount.toLocaleString()}</td>
                    <td className="py-2.5 pr-3 text-right text-slate-200">{c.skills}</td>
                    <td className="py-2.5 pr-3 text-right text-slate-200">{c.adoption}%</td>
                    <td className="py-2.5 pr-3 text-right" style={{ color: COLORS.green }}>+{c.productivity}%</td>
                    <td className="py-2.5 pr-3 text-right font-medium" style={{ color: riskTone(c.risk) }}>{c.risk}</td>
                    <td className="py-2.5 text-right text-slate-200">{c.engagement}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 p-6 text-center text-slate-600 text-[13px]" style={{ backgroundColor: "#f8fafc" }}>
            Leaf node — no further breakdown available.
          </div>
        )}
      </GlassPanel>
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3" style={{ backgroundColor: "#f8fafc" }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-[18px] font-semibold" style={{ color, fontFamily: "Outfit, sans-serif" }}>
        {value}
      </div>
    </div>
  );
}
