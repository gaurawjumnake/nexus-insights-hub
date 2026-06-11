import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Search,
  Download,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { GlassPanel, KpiCard, Pill, COLORS } from "@/components/workforce/ui";
import { useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce/data-management")({
  component: DataManagement,
});

type IngestionStatus = "Uploaded" | "Validating" | "Processing" | "Completed" | "Failed";

const VALIDATION = [
  { check: "Missing Columns", passed: 142, failed: 3, severity: "high" as const },
  { check: "Invalid Values", passed: 138, failed: 7, severity: "medium" as const },
  { check: "Duplicate Records", passed: 144, failed: 1, severity: "low" as const },
  { check: "Schema Mismatch", passed: 145, failed: 0, severity: "high" as const },
];

const PROCESSING_LOG: { ts: string; file: string; status: IngestionStatus; msg: string }[] = [
  { ts: "10:42:18", file: "employees_q3_2026.csv", status: "Completed", msg: "12,480 records ingested" },
  { ts: "10:39:02", file: "skills_inventory.xlsx", status: "Processing", msg: "Parsing 4,210 rows" },
  { ts: "10:36:55", file: "ai_usage_oct.json", status: "Validating", msg: "Schema check in progress" },
  { ts: "10:34:11", file: "engagement_survey.csv", status: "Uploaded", msg: "Awaiting validation" },
  { ts: "10:30:47", file: "attrition_legacy.csv", status: "Failed", msg: "3 missing required columns" },
  { ts: "10:28:01", file: "learning_records.xlsx", status: "Completed", msg: "8,920 records ingested" },
];

const HISTORY: {
  file: string;
  source: string;
  date: string;
  status: IngestionStatus;
  records: number;
  owner: string;
}[] = [
  { file: "employees_q3_2026.csv", source: "Workday", date: "2026-06-11", status: "Completed", records: 12480, owner: "S. Patel" },
  { file: "skills_inventory.xlsx", source: "Degreed", date: "2026-06-11", status: "Processing", records: 4210, owner: "M. Chen" },
  { file: "ai_usage_oct.json", source: "OpenAI Admin", date: "2026-06-11", status: "Validating", records: 22150, owner: "A. Rivera" },
  { file: "engagement_survey.csv", source: "Glint", date: "2026-06-10", status: "Completed", records: 9870, owner: "L. Brooks" },
  { file: "attrition_legacy.csv", source: "Manual", date: "2026-06-10", status: "Failed", records: 0, owner: "T. Nakamura" },
  { file: "learning_records.xlsx", source: "Coursera", date: "2026-06-09", status: "Completed", records: 8920, owner: "M. Chen" },
  { file: "copilot_seats.csv", source: "Microsoft 365", date: "2026-06-09", status: "Completed", records: 6340, owner: "A. Rivera" },
  { file: "comp_bands_2026.xlsx", source: "Mercer", date: "2026-06-08", status: "Completed", records: 1210, owner: "S. Patel" },
];

const TEMPLATES = [
  { name: "Employee Master", desc: "Headcount, role, location, manager hierarchy", cols: 28 },
  { name: "Skills Inventory", desc: "Skill code, proficiency, target, certification", cols: 14 },
  { name: "AI Usage Metrics", desc: "Tool, seat, weekly active, prompts, savings", cols: 18 },
  { name: "Learning Records", desc: "Course, hours, completion, score, vendor", cols: 12 },
  { name: "Engagement Survey", desc: "Pulse score, eNPS, manager NPS, drivers", cols: 22 },
  { name: "Attrition Dataset", desc: "Exit date, tenure, regrettable flag, reason", cols: 16 },
];

const EXPLORER_ROWS = Array.from({ length: 64 }, (_, i) => {
  const companies = ["Company A", "Company B", "Company C", "Company D", "Company E"];
  const depts = ["Engineering", "Sales", "Operations", "Finance", "Customer Success", "Product"];
  const tools = ["ChatGPT", "Copilot", "Claude", "Gemini", "Internal Agent"];
  return {
    id: `EMP-${10240 + i}`,
    company: companies[i % companies.length],
    dept: depts[i % depts.length],
    role: ["Analyst", "Manager", "Director", "Lead", "VP"][i % 5],
    tool: tools[i % tools.length],
    adoption: 40 + ((i * 7) % 60),
    proficiency: ["Beginner", "Intermediate", "Advanced", "Expert"][i % 4],
  };
});

function statusPill(s: IngestionStatus) {
  const map: Record<IngestionStatus, { tone: "indigo" | "amber" | "teal" | "green" | "red"; icon: typeof CheckCircle2 }> = {
    Uploaded: { tone: "indigo", icon: Upload },
    Validating: { tone: "amber", icon: Loader2 },
    Processing: { tone: "teal", icon: Loader2 },
    Completed: { tone: "green", icon: CheckCircle2 },
    Failed: { tone: "red", icon: XCircle },
  };
  const { tone, icon: Icon } = map[s];
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="w-3 h-3" style={{ color: tone === "green" ? COLORS.green : tone === "red" ? COLORS.red : tone === "amber" ? COLORS.amber : tone === "teal" ? COLORS.teal : COLORS.indigo }} />
      <Pill label={s} tone={tone} />
    </span>
  );
}

function DataManagement() {
  const { companyLabel } = useWorkforce();
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return EXPLORER_ROWS.filter(
      (r) =>
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.dept.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.tool.toLowerCase().includes(q),
    );
  }, [search]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Workforce Data Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Central ingestion hub for {companyLabel} · workforce & AI datasets
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <Database className="w-4 h-4" style={{ color: COLORS.teal }} />
          <span>Last sync · 2 min ago</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Files Ingested (30d)" value="142" trend="+18 this week" trendDirection="up" icon={<FileSpreadsheet className="w-5 h-5" />} accent={COLORS.indigo} />
        <KpiCard title="Total Records" value="2.84M" trend="+412K" trendDirection="up" icon={<Database className="w-5 h-5" />} accent={COLORS.teal} />
        <KpiCard title="Validation Pass Rate" value="96.8%" trend="+1.4%" trendDirection="up" icon={<CheckCircle2 className="w-5 h-5" />} accent={COLORS.green} />
        <KpiCard title="Failed Ingestions" value="4" trend="-2 vs last week" trendDirection="up" icon={<AlertTriangle className="w-5 h-5" />} accent={COLORS.amber} />
      </div>

      {/* Upload + Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassPanel
          title="File Upload Center"
          description="CSV, XLSX, JSON · drag-and-drop or browse"
          className="lg:col-span-2"
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-10 transition-colors"
            style={{
              borderColor: dragOver ? COLORS.indigo : "#cbd5e1",
              background: dragOver ? "rgba(99,102,241,0.06)" : "#f8fafc",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: `${COLORS.indigo}22`, color: COLORS.indigo }}
            >
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-slate-900">Drop files here or click to browse</div>
            <div className="text-[11px] text-slate-500 mt-1">Up to 500MB · CSV · XLSX · JSON</div>
            <div className="flex items-center gap-3 mt-4">
              <button
                className="text-xs px-4 py-2 rounded-md font-medium text-slate-900"
                style={{ background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.teal})` }}
              >
                Browse Files
              </button>
              <button className="text-xs px-4 py-2 rounded-md font-medium text-slate-700 border border-slate-200">
                Connect API Source
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: FileText, label: "CSV", color: COLORS.green },
              { icon: FileSpreadsheet, label: "XLSX", color: COLORS.teal },
              { icon: FileJson, label: "JSON", color: COLORS.amber },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200"
                style={{ background: "#f8fafc" }}
              >
                <f.icon className="w-4 h-4" style={{ color: f.color }} />
                <span className="text-xs text-slate-700">{f.label} supported</span>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel title="Validation Pipeline" description="Live data quality checks">
          <div className="space-y-3">
            {VALIDATION.map((v) => {
              const total = v.passed + v.failed;
              const pct = (v.passed / total) * 100;
              return (
                <div key={v.check}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-700">{v.check}</span>
                    <span className="text-[11px] text-slate-500">
                      {v.passed}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: v.failed === 0 ? COLORS.green : v.failed > 5 ? COLORS.amber : COLORS.teal,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      {/* Processing log + Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassPanel
          title="Processing Log"
          description="Real-time ingestion events"
          className="lg:col-span-2"
        >
          <div className="space-y-2">
            {PROCESSING_LOG.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: "#f8fafc" }}
              >
                <span className="text-[11px] text-slate-500 font-mono w-16">{l.ts}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-900 truncate">{l.file}</div>
                  <div className="text-[10px] text-slate-500">{l.msg}</div>
                </div>
                {statusPill(l.status)}
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel title="CSV Template Library" description="Standard schemas">
          <div className="space-y-2">
            {TEMPLATES.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200"
                style={{ background: "#f8fafc" }}
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-900 truncate">{t.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{t.desc}</div>
                </div>
                <button
                  className="shrink-0 ml-2 p-1.5 rounded-md border border-slate-200 hover:bg-slate-50"
                  title={`Download ${t.name} template (${t.cols} columns)`}
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Ingestion history */}
      <GlassPanel title="Ingestion History" description="Last 30 days">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                {["File Name", "Source", "Upload Date", "Status", "Records", "Owner"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((h, i) => (
                <tr key={i} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-slate-900">{h.file}</td>
                  <td className="px-3 py-2.5 text-slate-600">{h.source}</td>
                  <td className="px-3 py-2.5 text-slate-600">{h.date}</td>
                  <td className="px-3 py-2.5">{statusPill(h.status)}</td>
                  <td className="px-3 py-2.5 text-slate-700 tabular-nums">{h.records.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-slate-600">{h.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Explorer */}
      <GlassPanel
        title="Workforce Data Explorer"
        description="Search, filter, sort, paginate"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search records…"
                className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 w-56"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                {["Employee ID", "Company", "Department", "Role", "Primary AI Tool", "Adoption", "Proficiency"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-slate-900 font-mono">{r.id}</td>
                  <td className="px-3 py-2.5 text-slate-700">{r.company}</td>
                  <td className="px-3 py-2.5 text-slate-600">{r.dept}</td>
                  <td className="px-3 py-2.5 text-slate-600">{r.role}</td>
                  <td className="px-3 py-2.5 text-slate-700">{r.tool}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${r.adoption}%`,
                            background: r.adoption >= 70 ? COLORS.green : r.adoption >= 50 ? COLORS.teal : COLORS.amber,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600 tabular-nums">{r.adoption}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Pill
                      label={r.proficiency}
                      tone={
                        r.proficiency === "Expert"
                          ? "green"
                          : r.proficiency === "Advanced"
                            ? "teal"
                            : r.proficiency === "Intermediate"
                              ? "indigo"
                              : "amber"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-[11px] text-slate-500">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-600">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-1 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
