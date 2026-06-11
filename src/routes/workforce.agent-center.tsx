import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Bell,
  TrendingUp,
  ShieldAlert,
  GraduationCap,
  DollarSign,
  Sparkles,
  FileText,
  Activity,
  Database,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { GlassPanel, KpiCard, Pill, COLORS } from "@/components/workforce/ui";
import { useWorkforce } from "@/lib/workforce-context";

export const Route = createFileRoute("/workforce/agent-center")({
  component: AgentCenter,
});

type AgentStatus = "Idle" | "Running" | "Completed" | "Failed";

const AGENTS: {
  name: string;
  icon: typeof Bot;
  status: AgentStatus;
  findings: string;
  recommendation: string;
  confidence: number;
  lastRun: string;
  color: string;
}[] = [
  {
    name: "Adoption Analyst Agent",
    icon: TrendingUp,
    status: "Completed",
    findings: "Copilot adoption plateau at 62% in Company C — 18% gap vs portfolio leaders.",
    recommendation: "Launch role-based prompt clinics for Sales & Ops in Company C.",
    confidence: 92,
    lastRun: "2 min ago",
    color: COLORS.indigo,
  },
  {
    name: "Workforce Risk Agent",
    icon: ShieldAlert,
    status: "Running",
    findings: "Elevated regrettable attrition signal in Company B engineering (12.4%).",
    recommendation: "Trigger retention package review for top 40 IC engineers.",
    confidence: 87,
    lastRun: "Running…",
    color: COLORS.red,
  },
  {
    name: "Learning Advisor Agent",
    icon: GraduationCap,
    status: "Completed",
    findings: "Prompt engineering skill gap of 34% across 6,200 employees.",
    recommendation: "Enroll cohorts in 4-week applied AI bootcamp (est. $180/seat).",
    confidence: 89,
    lastRun: "14 min ago",
    color: COLORS.teal,
  },
  {
    name: "Cost Optimization Agent",
    icon: DollarSign,
    status: "Completed",
    findings: "$1.8M annualized SaaS overlap across Copilot + Claude Enterprise.",
    recommendation: "Consolidate licenses; expected EBITDA lift of 0.6%.",
    confidence: 94,
    lastRun: "1 hr ago",
    color: COLORS.green,
  },
  {
    name: "Value Creation Agent",
    icon: Sparkles,
    status: "Idle",
    findings: "Pending Q3 financial close to recompute ROI multiples.",
    recommendation: "Schedule run after EBITDA refresh on Jun 14.",
    confidence: 0,
    lastRun: "Scheduled",
    color: COLORS.amber,
  },
  {
    name: "Executive Summary Agent",
    icon: FileText,
    status: "Failed",
    findings: "Data dependency from Company E HRIS feed unavailable.",
    recommendation: "Retry after HRIS connector restored (ETA 30 min).",
    confidence: 0,
    lastRun: "8 min ago",
    color: COLORS.indigo,
  },
];

const BOARD_RECS: {
  rec: string;
  impact: "High" | "Medium" | "Low";
  priority: "P0" | "P1" | "P2";
  company: string;
  value: string;
}[] = [
  { rec: "Consolidate Copilot + Claude Enterprise licenses", impact: "High", priority: "P0", company: "Portfolio-wide", value: "$1.8M / yr" },
  { rec: "Retention bonus for top 40 IC engineers", impact: "High", priority: "P0", company: "Company B", value: "$4.2M risk avoided" },
  { rec: "Applied AI bootcamp for Sales & Ops", impact: "Medium", priority: "P1", company: "Company C", value: "$2.6M productivity" },
  { rec: "Deploy internal RAG agent for support tier-1", impact: "High", priority: "P1", company: "Company A", value: "$3.4M / yr" },
  { rec: "Sunset legacy BI tooling post-AI rollout", impact: "Medium", priority: "P2", company: "Company D", value: "$640K / yr" },
  { rec: "Standardize prompt library across portfolio", impact: "Medium", priority: "P2", company: "Portfolio-wide", value: "$1.1M / yr" },
];

const TIMELINE: { ts: string; kind: "agent" | "data" | "kpi" | "rec"; msg: string }[] = [
  { ts: "10:42", kind: "data", msg: "employees_q3_2026.csv ingested · 12,480 records" },
  { ts: "10:40", kind: "agent", msg: "Adoption Analyst Agent completed run #428" },
  { ts: "10:35", kind: "rec", msg: "New board recommendation: License consolidation ($1.8M)" },
  { ts: "10:30", kind: "agent", msg: "Workforce Risk Agent started run #319" },
  { ts: "10:24", kind: "kpi", msg: "Portfolio AI Readiness Score refreshed · 71 → 73" },
  { ts: "10:18", kind: "data", msg: "ai_usage_oct.json validation in progress" },
  { ts: "10:12", kind: "agent", msg: "Cost Optimization Agent completed run #156" },
  { ts: "10:05", kind: "rec", msg: "New board recommendation: Retention bonus (Company B)" },
];

const NOTIFICATIONS: { kind: "data" | "risk" | "agent" | "rec"; title: string; time: string }[] = [
  { kind: "data", title: "Data refresh completed · 142 files", time: "2m" },
  { kind: "risk", title: "New attrition risk · Company B engineering", time: "12m" },
  { kind: "agent", title: "Cost Optimization Agent finished", time: "1h" },
  { kind: "rec", title: "New recommendation: Consolidate AI licenses", time: "1h" },
  { kind: "data", title: "HRIS connector for Company E unreachable", time: "2h" },
];

function statusPill(s: AgentStatus) {
  if (s === "Completed") return <Pill label="Completed" tone="green" />;
  if (s === "Running") return <Pill label="Running" tone="teal" />;
  if (s === "Failed") return <Pill label="Failed" tone="red" />;
  return <Pill label="Idle" tone="slate" />;
}

function statusIcon(s: AgentStatus) {
  if (s === "Completed") return <CheckCircle2 className="w-4 h-4" style={{ color: COLORS.green }} />;
  if (s === "Running") return <Loader2 className="w-4 h-4 animate-spin" style={{ color: COLORS.teal }} />;
  if (s === "Failed") return <XCircle className="w-4 h-4" style={{ color: COLORS.red }} />;
  return <div className="w-2 h-2 rounded-full bg-slate-500" />;
}

function AgentCenter() {
  const { companyLabel } = useWorkforce();
  const running = AGENTS.filter((a) => a.status === "Running").length;
  const completed = AGENTS.filter((a) => a.status === "Completed").length;
  const failed = AGENTS.filter((a) => a.status === "Failed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            AI Talent Agent Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Multi-agent monitoring · {companyLabel}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md font-medium text-slate-900"
          style={{ background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.teal})` }}
        >
          <Play className="w-3.5 h-3.5" />
          Run All Agents
        </button>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Active Agents" value={`${AGENTS.length}`} trend={`${running} running`} trendDirection="neutral" icon={<Bot className="w-5 h-5" />} accent={COLORS.indigo} />
        <KpiCard title="Completed Runs (24h)" value="48" trend="+12" trendDirection="up" icon={<CheckCircle2 className="w-5 h-5" />} accent={COLORS.green} />
        <KpiCard title="Recommendations" value="23" trend="+6 today" trendDirection="up" icon={<Sparkles className="w-5 h-5" />} accent={COLORS.teal} />
        <KpiCard title="Avg Confidence" value="89%" trend="+2%" trendDirection="up" icon={<Activity className="w-5 h-5" />} accent={COLORS.amber} />
      </div>

      {/* Agent grid */}
      <GlassPanel title="Agent Fleet" description={`${completed} completed · ${running} running · ${failed} failed`}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {AGENTS.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.name}
                className="rounded-xl border border-slate-200 p-4"
                style={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, rgba(255,255,255,0) 100%), #0d1222",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${a.color}22`, color: a.color }}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900 leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {a.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Last run · {a.lastRun}</div>
                    </div>
                  </div>
                  {statusIcon(a.status)}
                </div>

                <div className="mb-2">{statusPill(a.status)}</div>

                <div className="mt-3 space-y-2.5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Findings</div>
                    <div className="text-[12px] text-slate-700 leading-relaxed">{a.findings}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Recommendation</div>
                    <div className="text-[12px] text-slate-700 leading-relaxed">{a.recommendation}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Confidence</span>
                    <span className="text-xs font-semibold text-slate-900 tabular-nums">
                      {a.confidence > 0 ? `${a.confidence}%` : "—"}
                    </span>
                  </div>
                  <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                    <div
                      className="h-full"
                      style={{
                        width: `${a.confidence}%`,
                        background:
                          a.confidence >= 90 ? COLORS.green : a.confidence >= 80 ? COLORS.teal : a.confidence > 0 ? COLORS.amber : "transparent",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Board Recommendations */}
        <GlassPanel
          title="Board Recommendations Feed"
          description="Generated by agent fleet · ranked by impact"
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  {["Recommendation", "Impact", "Priority", "Company", "Est. Value"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BOARD_RECS.map((r, i) => (
                  <tr key={i} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-slate-900">{r.rec}</td>
                    <td className="px-3 py-2.5">
                      <Pill label={r.impact} tone={r.impact === "High" ? "green" : r.impact === "Medium" ? "teal" : "slate"} />
                    </td>
                    <td className="px-3 py-2.5">
                      <Pill label={r.priority} tone={r.priority === "P0" ? "red" : r.priority === "P1" ? "amber" : "indigo"} />
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{r.company}</td>
                    <td className="px-3 py-2.5 text-slate-700 tabular-nums">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* Notifications */}
        <GlassPanel
          title="Notifications"
          description="Real-time alerts"
          action={
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full" style={{ background: `${COLORS.red}1a`, color: COLORS.red }}>
              <Bell className="w-3 h-3" />
              {NOTIFICATIONS.length}
            </span>
          }
        >
          <div className="space-y-2">
            {NOTIFICATIONS.map((n, i) => {
              const tone =
                n.kind === "risk" ? COLORS.red : n.kind === "agent" ? COLORS.indigo : n.kind === "rec" ? COLORS.teal : COLORS.green;
              const Icon =
                n.kind === "risk" ? AlertTriangle : n.kind === "agent" ? Bot : n.kind === "rec" ? Sparkles : Database;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg"
                  style={{ background: "#f8fafc" }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${tone}22`, color: tone }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-slate-900 leading-tight">{n.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{n.time} ago</div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      {/* Activity Timeline */}
      <GlassPanel title="Activity Timeline" description="Agent executions · data ingestion · KPI refresh · recommendation generation">
        <div className="relative pl-5">
          <div className="absolute left-2 top-1 bottom-1 w-px" style={{ background: "#cbd5e1" }} />
          <div className="space-y-3">
            {TIMELINE.map((t, i) => {
              const tone =
                t.kind === "agent" ? COLORS.indigo : t.kind === "data" ? COLORS.teal : t.kind === "kpi" ? COLORS.amber : COLORS.green;
              const Icon = t.kind === "agent" ? Bot : t.kind === "data" ? Database : t.kind === "kpi" ? Zap : Sparkles;
              return (
                <div key={i} className="relative flex items-center gap-3">
                  <div
                    className="absolute -left-5 w-3 h-3 rounded-full ring-4"
                    style={{ background: tone, boxShadow: `0 0 0 3px ${tone}22` }}
                  />
                  <span className="text-[11px] text-slate-500 font-mono w-12">{t.ts}</span>
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${tone}22`, color: tone }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-slate-700">{t.msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
