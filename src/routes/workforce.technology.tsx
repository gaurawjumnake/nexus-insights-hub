import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Cpu,
  DollarSign,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Boxes,
  Layers,
  Zap,
  Server,
  Bot,
  TrendingUp,
  ChevronRight,
  Lightbulb,
  Wrench,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { COLORS, GlassPanel, KpiCard, Pill } from "@/components/workforce/ui";
import { useWorkforce } from "@/lib/workforce-context";
import { useKpis } from "@/hooks/useKpis";
import { usePortfolioKpis } from "@/hooks/usePortfolioKpis";
import { DEFAULT_PERIOD } from "@/services/kpiService";

export const Route = createFileRoute("/workforce/technology")({
  component: TechnologyPersonaView,
});

// ============ Section 2 - Platform Health ============
const PLATFORM_KPIS = [
  { title: "Availability", value: "99.94%", trend: "+0.12%", icon: <Activity className="w-4 h-4" />, accent: COLORS.green, footer: "Rolling 30d" },
  { title: "Latency P95", value: "612 ms", trend: "-71 ms", icon: <Gauge className="w-4 h-4" />, accent: COLORS.teal, footer: "SLO 800 ms" },
  { title: "Error Rate", value: "0.42%", trend: "-0.18 pp", icon: <AlertTriangle className="w-4 h-4" />, accent: COLORS.red, footer: "Target <1%", trendDirection: "down" as const },
  { title: "Throughput", value: "8.4k rpm", trend: "+22%", icon: <Zap className="w-4 h-4" />, accent: COLORS.indigo, footer: "Peak 12.1k rpm" },
  { title: "MTTR", value: "42 min", trend: "-14 min", icon: <Wrench className="w-4 h-4" />, accent: COLORS.amber, footer: "Target 60 min", trendDirection: "down" as const },
  { title: "Fallback Rate", value: "2.1%", trend: "-0.6 pp", icon: <Server className="w-4 h-4" />, accent: COLORS.violet, footer: "To secondary model", trendDirection: "down" as const },
];

const PLATFORM_TREND = [
  { p: "W1", avail: 99.82, latency: 720, error: 0.71, throughput: 6.2, mttr: 64 },
  { p: "W2", avail: 99.86, latency: 690, error: 0.66, throughput: 6.8, mttr: 58 },
  { p: "W3", avail: 99.88, latency: 660, error: 0.58, throughput: 7.1, mttr: 54 },
  { p: "W4", avail: 99.90, latency: 640, error: 0.52, throughput: 7.6, mttr: 50 },
  { p: "W5", avail: 99.92, latency: 625, error: 0.48, throughput: 8.0, mttr: 46 },
  { p: "W6", avail: 99.94, latency: 612, error: 0.42, throughput: 8.4, mttr: 42 },
];

const PORTFOLIO_HEALTH = [
  { company: "Provation", avail: 99.97, latency: 380, error: 0.18, status: "green" },
  { company: "Fluke", avail: 99.92, latency: 470, error: 0.41, status: "green" },
  { company: "Novamind", avail: 99.86, latency: 540, error: 0.62, status: "amber" },
  { company: "Gordian", avail: 99.74, latency: 690, error: 1.12, status: "amber" },
  { company: "Catalent", avail: 99.41, latency: 920, error: 2.34, status: "red" },
];

// ============ Section 3 - Model Portfolio ============
const MODEL_KPIS = [
  { title: "Total Requests", value: "118M", trend: "+24% MoM", icon: <Cpu className="w-4 h-4" />, accent: COLORS.teal, footer: "All models, last 30d" },
  { title: "Token Consumption", value: "8.4B", trend: "+31% MoM", icon: <Layers className="w-4 h-4" />, accent: COLORS.indigo, footer: "Input + output" },
  { title: "Monthly Model Cost", value: "$842K", trend: "+18% MoM", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.amber, trendDirection: "down" as const, footer: "59% of total AI spend" },
  { title: "Avg Response Time", value: "1.4 s", trend: "-0.3 s", icon: <Gauge className="w-4 h-4" />, accent: COLORS.violet, footer: "Weighted across models" },
  { title: "User Satisfaction", value: "4.4 / 5", trend: "+0.3", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.green, footer: "Thumb-up rate 87%" },
  { title: "Blended Model ROI", value: "3.2x", trend: "+0.4x", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.blue, footer: "Value / model cost" },
];

const MODELS = [
  { name: "GPT-4o", usage: "42M req", cost: 312, quality: 92, latency: 1.1, roi: "4.1x", rec: "Optimize", tone: "amber" as const },
  { name: "Claude 3.5 Sonnet", usage: "31M req", cost: 198, quality: 94, latency: 1.3, roi: "3.8x", rec: "Expand", tone: "green" as const },
  { name: "Gemini 1.5 Pro", usage: "18M req", cost: 124, quality: 86, latency: 1.6, roi: "2.9x", rec: "Review", tone: "blue" as const },
  { name: "Llama 3.1 70B", usage: "14M req", cost: 86, quality: 81, latency: 1.8, roi: "3.4x", rec: "Expand", tone: "green" as const },
  { name: "Mistral Large", usage: "8M req", cost: 64, quality: 78, latency: 2.0, roi: "2.1x", rec: "Retire", tone: "red" as const },
  { name: "Internal RAG-7B", usage: "5M req", cost: 58, quality: 74, latency: 0.9, roi: "5.6x", rec: "Expand", tone: "green" as const },
];

const COST_BY_MODEL = MODELS.map((m) => ({ name: m.name, cost: m.cost }));
const QUALITY_VS_COST = MODELS.map((m) => ({ name: m.name, quality: m.quality, cost: m.cost }));

// ============ Section 4 - Applications & Agents ============
const APP_KPIS = [
  { title: "Total Applications", value: "112", trend: "+18", icon: <Boxes className="w-4 h-4" />, accent: COLORS.teal, footer: "Across portfolio" },
  { title: "In Production", value: "47", trend: "+9", icon: <Server className="w-4 h-4" />, accent: COLORS.green, footer: "Live & serving users" },
  { title: "In Pilot", value: "28", trend: "+6", icon: <Bot className="w-4 h-4" />, accent: COLORS.amber, footer: "UAT or limited rollout" },
  { title: "Retired", value: "14", trend: "+3", icon: <Wrench className="w-4 h-4" />, accent: COLORS.violet, footer: "Sunset last 90d" },
  { title: "Failed Pilots", value: "9", trend: "-2", icon: <AlertTriangle className="w-4 h-4" />, accent: COLORS.red, trendDirection: "down" as const, footer: "Did not reach prod" },
];

const LIFECYCLE = [
  { stage: "Idea", count: 38, color: COLORS.indigo },
  { stage: "Discovery", count: 24, color: COLORS.blue },
  { stage: "Pilot", count: 28, color: COLORS.amber },
  { stage: "UAT", count: 11, color: COLORS.violet },
  { stage: "Production", count: 47, color: COLORS.green },
  { stage: "Retired", count: 14, color: COLORS.red },
];

const APPS_BY_COMPANY = [
  { company: "Provation", apps: 28 },
  { company: "Fluke", apps: 22 },
  { company: "Novamind", apps: 19 },
  { company: "Gordian", apps: 16 },
  { company: "Catalent", apps: 14 },
  { company: "HQ Platform", apps: 13 },
];

const APPS_BY_FUNCTION = [
  { name: "Sales", value: 22, color: COLORS.teal },
  { name: "Support", value: 18, color: COLORS.indigo },
  { name: "Engineering", value: 16, color: COLORS.violet },
  { name: "Finance", value: 11, color: COLORS.amber },
  { name: "Operations", value: 26, color: COLORS.blue },
  { name: "HR", value: 19, color: COLORS.green },
];

const AGENT_TREND = [
  { p: "Jan", agents: 14 }, { p: "Feb", agents: 18 }, { p: "Mar", agents: 23 },
  { p: "Apr", agents: 28 }, { p: "May", agents: 34 }, { p: "Jun", agents: 41 },
  { p: "Jul", agents: 47 }, { p: "Aug", agents: 53 },
];

const APP_INVENTORY = [
  { app: "Sales Copilot", company: "Provation", owner: "M. Chen", stage: "Production", users: "1.2k", cost: "$48k/mo", roi: "4.3x", health: 94 },
  { app: "Support Agent", company: "Novamind", owner: "R. Patel", stage: "Production", users: "640", cost: "$31k/mo", roi: "3.8x", health: 91 },
  { app: "Proposal Studio", company: "Fluke", owner: "J. Kim", stage: "Production", users: "210", cost: "$22k/mo", roi: "3.1x", health: 88 },
  { app: "Finance Close Bot", company: "Catalent", owner: "S. Ali", stage: "UAT", users: "84", cost: "$14k/mo", roi: "2.6x", health: 76 },
  { app: "Knowledge Search", company: "Portfolio", owner: "L. Ortiz", stage: "Production", users: "3.1k", cost: "$39k/mo", roi: "5.6x", health: 96 },
  { app: "Content Studio", company: "Gordian", owner: "T. Yamada", stage: "Pilot", users: "46", cost: "$11k/mo", roi: "—", health: 62 },
  { app: "Procurement Agent", company: "Novamind", owner: "P. Singh", stage: "Pilot", users: "32", cost: "$9k/mo", roi: "—", health: 58 },
];

// ============ Section 5 - Reliability ============
const RELIABILITY_KPIS = [
  { title: "Critical Incidents", value: "0", trend: "-1", icon: <AlertTriangle className="w-4 h-4" />, accent: COLORS.red, trendDirection: "down" as const, footer: "Last 30 days" },
  { title: "Major Incidents", value: "1", trend: "-2", icon: <AlertTriangle className="w-4 h-4" />, accent: COLORS.amber, trendDirection: "down" as const, footer: "P1/P2 last 30d" },
  { title: "Availability", value: "99.94%", trend: "+0.12%", icon: <Activity className="w-4 h-4" />, accent: COLORS.green, footer: "Portfolio weighted" },
  { title: "MTTR", value: "42 min", trend: "-14 min", icon: <Wrench className="w-4 h-4" />, accent: COLORS.indigo, trendDirection: "down" as const, footer: "Target 60 min" },
  { title: "Error Rate", value: "0.42%", trend: "-0.18 pp", icon: <Gauge className="w-4 h-4" />, accent: COLORS.violet, trendDirection: "down" as const, footer: "Across all apps" },
];

const INCIDENT_TREND = [
  { p: "W1", crit: 1, high: 3, med: 6 }, { p: "W2", crit: 0, high: 4, med: 5 },
  { p: "W3", crit: 1, high: 2, med: 4 }, { p: "W4", crit: 0, high: 2, med: 5 },
  { p: "W5", crit: 0, high: 1, med: 3 }, { p: "W6", crit: 0, high: 1, med: 2 },
];

const RELIABILITY_RANK = [
  { app: "Knowledge Search", avail: 99.98, errors: 0.08 },
  { app: "Sales Copilot", avail: 99.96, errors: 0.14 },
  { app: "Support Agent", avail: 99.93, errors: 0.22 },
  { app: "Proposal Studio", avail: 99.89, errors: 0.38 },
  { app: "Finance Close Bot", avail: 99.74, errors: 0.94 },
  { app: "Content Studio", avail: 99.41, errors: 1.82 },
];

const INCIDENTS = [
  { id: "INC-2418", severity: "High", app: "Finance Close Bot", company: "Catalent", cause: "Model timeout cascade", mttr: "1h 12m" },
  { id: "INC-2412", severity: "Medium", app: "Content Studio", company: "Gordian", cause: "Quota throttling", mttr: "38m" },
  { id: "INC-2407", severity: "Medium", app: "Procurement Agent", company: "Novamind", cause: "Vector index drift", mttr: "52m" },
  { id: "INC-2401", severity: "Low", app: "Sales Copilot", company: "Provation", cause: "Prompt regression", mttr: "21m" },
  { id: "INC-2396", severity: "High", app: "Support Agent", company: "Novamind", cause: "Upstream API outage", mttr: "1h 44m" },
];

// ============ Section 6 - Governance ============
const GOV_KPIS = [
  { title: "Governance Score", value: "82/100", trend: "+6 pts", icon: <ShieldCheck className="w-4 h-4" />, accent: COLORS.violet, footer: "Composite index" },
  { title: "Policy Compliance", value: "96%", trend: "+2 pp", icon: <ShieldCheck className="w-4 h-4" />, accent: COLORS.green, footer: "Active deployments" },
  { title: "Audit Coverage", value: "88%", trend: "+9 pp", icon: <Activity className="w-4 h-4" />, accent: COLORS.teal, footer: "Of high-risk apps" },
  { title: "Human Review Coverage", value: "74%", trend: "+11 pp", icon: <Bot className="w-4 h-4" />, accent: COLORS.indigo, footer: "Critical decisions" },
  { title: "Risk Assessments", value: "62", trend: "+14", icon: <ShieldCheck className="w-4 h-4" />, accent: COLORS.blue, footer: "Completed YTD" },
  { title: "AI Incidents", value: "3", trend: "-4", icon: <AlertTriangle className="w-4 h-4" />, accent: COLORS.red, trendDirection: "down" as const, footer: "Last 30 days" },
];

const COMPLIANCE_TREND = [
  { p: "Q1", v: 84 }, { p: "Q2", v: 88 }, { p: "Q3", v: 92 }, { p: "Q4", v: 96 },
];

const RISK_MATRIX: { cat: string; sev: "Low" | "Medium" | "High" | "Critical"; count: number }[] = [
  { cat: "Security", sev: "Medium", count: 4 },
  { cat: "Privacy", sev: "High", count: 2 },
  { cat: "Regulatory", sev: "Medium", count: 3 },
  { cat: "Model Drift", sev: "High", count: 5 },
  { cat: "Hallucination", sev: "Medium", count: 7 },
  { cat: "Bias", sev: "Low", count: 2 },
  { cat: "Operational", sev: "Low", count: 6 },
];

// ============ Section 7 - FinOps ============
const FINOPS_KPIS = [
  { title: "Total AI Spend (MTD)", value: "$1.42M", trend: "+11% MoM", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.teal, trendDirection: "down" as const, footer: "All categories" },
  { title: "Forecast Spend", value: "$1.58M", trend: "+18% vs budget", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.amber, trendDirection: "down" as const, footer: "End of month" },
  { title: "Budget Adherence", value: "94%", trend: "-3 pp", icon: <Gauge className="w-4 h-4" />, accent: COLORS.indigo, footer: "Target 95-100%" },
  { title: "Cost per Outcome", value: "$0.42", trend: "-12%", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.green, footer: "Per successful task" },
  { title: "Cost per User", value: "$34 / mo", trend: "-8%", icon: <Bot className="w-4 h-4" />, accent: COLORS.violet, footer: "Active AI users" },
  { title: "Cost per App", value: "$28k / mo", trend: "+4%", icon: <Boxes className="w-4 h-4" />, accent: COLORS.blue, trendDirection: "down" as const, footer: "Production avg" },
];

const SPEND_TREND = [
  { p: "Jan", actual: 0.88, budget: 0.95 }, { p: "Feb", actual: 0.94, budget: 1.00 },
  { p: "Mar", actual: 1.02, budget: 1.05 }, { p: "Apr", actual: 1.12, budget: 1.15 },
  { p: "May", actual: 1.24, budget: 1.25 }, { p: "Jun", actual: 1.30, budget: 1.32 },
  { p: "Jul", actual: 1.42, budget: 1.40 }, { p: "Aug", actual: 1.58, budget: 1.45 },
];

const SPEND_BY_COMPANY = [
  { company: "Provation", spend: 384 },
  { company: "Fluke", spend: 296 },
  { company: "Novamind", spend: 248 },
  { company: "Gordian", spend: 196 },
  { company: "Catalent", spend: 162 },
  { company: "HQ Platform", spend: 134 },
];

const OPTIMIZATIONS = [
  { name: "Reduce GPT-4o usage for internal search", area: "Model Routing", savings: "$420k / yr", complexity: "Low", priority: "High" },
  { name: "Introduce prompt caching across copilots", area: "Caching", savings: "$280k / yr", complexity: "Low", priority: "High" },
  { name: "Route low-complexity tasks to Llama 3.1", area: "Model Routing", savings: "$340k / yr", complexity: "Medium", priority: "High" },
  { name: "Compress system prompts (avg -38%)", area: "Prompt Optimization", savings: "$160k / yr", complexity: "Low", priority: "Medium" },
  { name: "Consolidate vector DB vendors", area: "Vendor Consolidation", savings: "$220k / yr", complexity: "Medium", priority: "Medium" },
  { name: "Retire Mistral Large deployments", area: "Model Portfolio", savings: "$95k / yr", complexity: "Low", priority: "Medium" },
];

// ============ Section 8 - Architecture Advisor ============
const ADVISOR = [
  { rec: "Reduce GPT-4o usage for internal search", biz: "Faster portfolio knowledge access", tech: "Route to Internal RAG-7B for low-risk queries", savings: "$420k / yr", conf: 94, prio: "High" },
  { rec: "Standardize on shared inference gateway", biz: "Unified observability + cost control", tech: "Replace 4 per-PortCo gateways with HQ gateway", savings: "$310k / yr", conf: 91, prio: "High" },
  { rec: "Retire Content Studio pilot at Gordian", biz: "Eliminates 23% of failed-pilot drag", tech: "Migrate users to shared Marketing Studio", savings: "$132k / yr", conf: 88, prio: "High" },
  { rec: "Adopt prompt caching across copilots", biz: "Latency -28%, cost -22% on hot prompts", tech: "Enable Redis-backed cache + TTL policy", savings: "$280k / yr", conf: 92, prio: "High" },
  { rec: "Consolidate duplicate support agents", biz: "Single CSAT surface across PortCos", tech: "Merge 3 agents into Novamind reference impl", savings: "$240k / yr", conf: 84, prio: "Medium" },
  { rec: "Introduce model router with quality SLO", biz: "Reliability up, cost-per-outcome -18%", tech: "Open-source LiteLLM + quality scorer", savings: "$360k / yr", conf: 81, prio: "Medium" },
  { rec: "Add drift monitoring on Finance Close Bot", biz: "Prevents future audit findings", tech: "Weekly eval harness + alerting", savings: "Risk reduction", conf: 86, prio: "Medium" },
];

const CTO_QUESTIONS = [
  { q: "Which models generate the highest cost?", a: "GPT-4o at $312k/mo (37% of model spend), followed by Claude 3.5 Sonnet ($198k). 41% of GPT-4o traffic is low-complexity and routable to cheaper models.", kpi: "GPT-4o · $312k/mo", rca: "Default routing in copilots sends every query to GPT-4o, regardless of complexity.", action: "Deploy model router with complexity classifier; expected $340k/yr savings." },
  { q: "Which applications should be retired?", a: "Content Studio (Gordian) and Procurement Agent (Novamind) — both pilots with <60 health, <50 users, and ROI not validated after 90 days.", kpi: "2 apps · $20k/mo", rca: "Insufficient executive sponsorship and overlap with shared HQ tools.", action: "Sunset within 30 days; migrate users to portfolio reference implementations." },
  { q: "Which systems create reliability risk?", a: "Finance Close Bot (Catalent) at 99.41% availability and 2.34% error rate. Single point of failure on upstream forecasting API.", kpi: "1 app · 99.41%", rca: "No fallback model + synchronous upstream dependency.", action: "Add fallback to Claude 3.5 Sonnet + circuit breaker; expected MTTR -45%." },
  { q: "Where are governance gaps?", a: "Human review coverage on Customer Response AI is 58% — well below 80% threshold for high-impact externally-facing decisions.", kpi: "Review coverage 58%", rca: "Reviewer staffing gap + lack of sampling policy.", action: "Stand up review queue with stratified sampling; target 85% by Q4." },
  { q: "Which PortCo has the most mature AI platform?", a: "Provation. 28 apps in production, 99.97% availability, governance score 91, ROI 4.3x.", kpi: "Provation · 91/100", rca: "Centralized platform team, shared inference gateway, mature MLOps practice.", action: "Anoint Provation platform as portfolio reference architecture." },
  { q: "What is driving AI spend growth?", a: "Token volume on GPT-4o (+38% MoM) and net-new apps in production (+9 QoQ). Unit economics are improving but volume outpaces optimization.", kpi: "+11% MoM spend", rca: "Demand from new sales/support deployments + no caching layer.", action: "Implement prompt caching + model routing this quarter." },
  { q: "Which applications deliver the lowest ROI?", a: "Content Studio and Procurement Agent (no validated ROI after 90 days). Mistral Large deployments at 2.1x vs portfolio median 3.4x.", kpi: "2 apps + 1 model", rca: "Use case fit gap + better-performing alternatives available.", action: "Retire / replace within next operating cycle." },
  { q: "Which pilots are stuck and should be terminated?", a: "9 pilots have exceeded 120 days without prod approval. 5 lack executive sponsor; 4 lack validated KPI uplift.", kpi: "9 stuck pilots", rca: "No pilot exit criteria + over-allocated platform team.", action: "Apply 90-day exit criteria policy; terminate or promote each pilot." },
];

const DEBT = [
  { name: "Consolidate duplicate agents", savings: "$240k / yr", effort: "Medium", priority: "High", timeline: "Q4 2026" },
  { name: "Replace expensive models on hot paths", savings: "$340k / yr", effort: "Medium", priority: "High", timeline: "Q4 2026" },
  { name: "Retire low-adoption applications", savings: "$152k / yr", effort: "Low", priority: "High", timeline: "Next 30 days" },
  { name: "Improve caching strategy", savings: "$280k / yr", effort: "Low", priority: "High", timeline: "Q4 2026" },
  { name: "Reduce average prompt size 30%", savings: "$160k / yr", effort: "Low", priority: "Medium", timeline: "Q1 2027" },
  { name: "Standardize on reference architecture", savings: "$310k / yr", effort: "High", priority: "Medium", timeline: "Q2 2027" },
];

// =================================================================

function TechnologyPersonaView() {
  const { companyLabel } = useWorkforce();
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            Technology Persona · Detail Insights
          </div>
          <h1
            className="mt-1 text-2xl font-semibold text-slate-900"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            AI Platform Command Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            How healthy, scalable, secure and cost-effective is the AI technology portfolio at{" "}
            <span className="font-medium text-slate-700">{companyLabel}</span>?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill label="CTO" tone="blue" />
          <Pill label="CIO" tone="indigo" />
          <Pill label="Architects" tone="violet" />
          <Pill label="Platform Owners" tone="teal" />
        </div>
      </div>

      <Section1ExecKPIs />
      <Section2Platform />
      <Section3Models />
      <Section4Apps />
      <Section5Reliability />
      <Section6Governance />
      <Section7FinOps />
      <Section8Advisor />
      <SectionCTOQuestions />
      <SectionDebt />
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between border-b border-slate-200 pb-2">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</div>
        <h2 className="mt-0.5 text-lg font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{title}</h2>
      </div>
    </div>
  );
}

/** Resolves the active KPI set: a single company's KPIs, or the portfolio rollup when "All" is selected. */
function useActiveKpis() {
  const { company, period } = useWorkforce();
  const activePeriod = period ?? DEFAULT_PERIOD;
  const portfolioResult = usePortfolioKpis(activePeriod);
  const singleResult = useKpis(company !== "all" ? company : "", activePeriod);
  if (company === "all") {
    return { kpis: portfolioResult.portfolio, isLoading: portfolioResult.isLoadingKpis };
  }
  return { kpis: singleResult.kpis, isLoading: singleResult.isLoading };
}

function Section1ExecKPIs() {
  const { kpis, isLoading } = useActiveKpis();
  const cards = [
    { id: "availability_uptime", title: "Platform Availability", icon: <Activity className="w-4 h-4" />, accent: COLORS.green },
    { id: "percent_ai_in_production", title: "AI in Production", icon: <Boxes className="w-4 h-4" />, accent: COLORS.indigo },
    { id: "total_ai_spend", title: "Total AI Spend", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.amber },
    { id: "p95_latency", title: "P95 Latency", icon: <Gauge className="w-4 h-4" />, accent: COLORS.teal },
    { id: "ai_governance_score", title: "Governance Score", icon: <ShieldCheck className="w-4 h-4" />, accent: COLORS.violet },
    { id: "critical_incident_count", title: "Critical Incidents", icon: <AlertTriangle className="w-4 h-4" />, accent: COLORS.red },
  ];
  return (
    <section>
      <SectionHeader eyebrow="Section 1" title="Executive Technology KPI Summary" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <KpiCard
            key={c.id}
            title={c.title}
            icon={c.icon}
            accent={c.accent}
            value={isLoading ? "…" : kpis[c.id]?.display ?? "No data"}
            footer={isLoading ? undefined : kpis[c.id] ? `Coverage ${Math.round((kpis[c.id].coverage ?? 0) * 100)}%` : "Not yet calculated"}
          />
        ))}
      </div>
    </section>
  );
}

function Section2Platform() {
  return (
    <section>
      <SectionHeader eyebrow="Section 2" title="AI Platform Health" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {PLATFORM_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel title="Availability & Latency Trend" description="6-week rolling window">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={PLATFORM_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="l" stroke="#64748b" tick={{ fontSize: 11 }} domain={[99.7, 100]} />
                <YAxis yAxisId="r" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="l" type="monotone" dataKey="avail" name="Availability %" stroke={COLORS.green} strokeWidth={2.5} dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="latency" name="Latency P95 (ms)" stroke={COLORS.teal} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Error & Throughput Trend" description="Errors %, Throughput (k rpm)">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={PLATFORM_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="l" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="r" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="l" type="monotone" dataKey="error" name="Error %" stroke={COLORS.red} strokeWidth={2.5} dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="throughput" name="Throughput" stroke={COLORS.indigo} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Portfolio Platform Health" description="Availability · Latency · Error Rate" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Company</th>
                <th className="py-2">Availability</th>
                <th className="py-2">Latency P95</th>
                <th className="py-2">Error Rate</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {PORTFOLIO_HEALTH.map((r) => (
                <tr key={r.company} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{r.company}</td>
                  <td className="py-2.5 text-slate-700">{r.avail}%</td>
                  <td className="py-2.5 text-slate-700">{r.latency} ms</td>
                  <td className="py-2.5 text-slate-700">{r.error}%</td>
                  <td className="py-2.5">
                    <Pill label={r.status === "green" ? "Healthy" : r.status === "amber" ? "Watch" : "At Risk"} tone={r.status === "green" ? "green" : r.status === "amber" ? "amber" : "red"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}

function Section3Models() {
  return (
    <section>
      <SectionHeader eyebrow="Section 3" title="AI Model Portfolio" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {MODEL_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel title="Monthly Cost by Model" description="$K, last 30d">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={COST_BY_MODEL}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="cost" fill={COLORS.amber} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
        <GlassPanel title="Quality vs Cost" description="Quality score (0-100) overlaid with cost ($K)">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={QUALITY_VS_COST}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis yAxisId="l" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="r" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="l" dataKey="quality" name="Quality" fill={COLORS.violet} radius={[6, 6, 0, 0]} />
                <Bar yAxisId="r" dataKey="cost" name="Cost ($K)" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Model Comparison" description="Usage · Cost · Quality · Latency · ROI · Recommendation" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Model</th>
                <th className="py-2">Usage</th>
                <th className="py-2">Cost ($K)</th>
                <th className="py-2">Quality</th>
                <th className="py-2">Latency</th>
                <th className="py-2">ROI</th>
                <th className="py-2">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.name} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{m.name}</td>
                  <td className="py-2.5 text-slate-700">{m.usage}</td>
                  <td className="py-2.5 text-slate-700">${m.cost}K</td>
                  <td className="py-2.5 text-slate-700">{m.quality}/100</td>
                  <td className="py-2.5 text-slate-700">{m.latency}s</td>
                  <td className="py-2.5 text-slate-700">{m.roi}</td>
                  <td className="py-2.5"><Pill label={m.rec} tone={m.tone} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}

function Section4Apps() {
  return (
    <section>
      <SectionHeader eyebrow="Section 4" title="AI Applications & Agent Inventory" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {APP_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="Application Lifecycle Funnel" description="Count of apps by stage">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={LIFECYCLE} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="stage" stroke="#64748b" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {LIFECYCLE.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
        <GlassPanel title="Applications by Portfolio Company" description="Count across PortCos">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={APPS_BY_COMPANY}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="company" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="apps" fill={COLORS.indigo} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
        <GlassPanel title="Applications by Function" description="% of total inventory">
          <div className="h-60">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={APPS_BY_FUNCTION} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {APPS_BY_FUNCTION.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Agent Adoption Trend" description="Active production agents over time" className="mt-4">
        <div className="h-60">
          <ResponsiveContainer>
            <AreaChart data={AGENT_TREND}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="agents" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.18} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      <GlassPanel title="Application Inventory" description="Production & near-production apps" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Application</th>
                <th className="py-2">Company</th>
                <th className="py-2">Owner</th>
                <th className="py-2">Stage</th>
                <th className="py-2">Users</th>
                <th className="py-2">Cost</th>
                <th className="py-2">ROI</th>
                <th className="py-2">Health</th>
              </tr>
            </thead>
            <tbody>
              {APP_INVENTORY.map((a) => (
                <tr key={a.app} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{a.app}</td>
                  <td className="py-2.5 text-slate-700">{a.company}</td>
                  <td className="py-2.5 text-slate-700">{a.owner}</td>
                  <td className="py-2.5"><Pill label={a.stage} tone={a.stage === "Production" ? "green" : a.stage === "UAT" ? "blue" : "amber"} /></td>
                  <td className="py-2.5 text-slate-700">{a.users}</td>
                  <td className="py-2.5 text-slate-700">{a.cost}</td>
                  <td className="py-2.5 text-slate-700">{a.roi}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${a.health}%`, background: a.health > 85 ? COLORS.green : a.health > 70 ? COLORS.amber : COLORS.red }} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600">{a.health}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}

function Section5Reliability() {
  return (
    <section>
      <SectionHeader eyebrow="Section 5" title="Reliability Command Center" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {RELIABILITY_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel title="Incident Trend" description="By severity, 6 weeks">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={INCIDENT_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="crit" stackId="a" name="Critical" fill={COLORS.red} />
                <Bar dataKey="high" stackId="a" name="High" fill={COLORS.amber} />
                <Bar dataKey="med" stackId="a" name="Medium" fill={COLORS.indigo} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
        <GlassPanel title="Reliability Ranking" description="Availability % by application">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={RELIABILITY_RANK} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} domain={[99, 100]} />
                <YAxis type="category" dataKey="app" stroke="#64748b" tick={{ fontSize: 11 }} width={120} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="avail" fill={COLORS.green} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Incident Log" description="Last 30 days" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Incident</th>
                <th className="py-2">Severity</th>
                <th className="py-2">Application</th>
                <th className="py-2">Company</th>
                <th className="py-2">Root Cause</th>
                <th className="py-2">MTTR</th>
              </tr>
            </thead>
            <tbody>
              {INCIDENTS.map((i) => (
                <tr key={i.id} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{i.id}</td>
                  <td className="py-2.5"><Pill label={i.severity} tone={i.severity === "High" ? "red" : i.severity === "Medium" ? "amber" : "slate"} /></td>
                  <td className="py-2.5 text-slate-700">{i.app}</td>
                  <td className="py-2.5 text-slate-700">{i.company}</td>
                  <td className="py-2.5 text-slate-700">{i.cause}</td>
                  <td className="py-2.5 text-slate-700">{i.mttr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}

function Section6Governance() {
  return (
    <section>
      <SectionHeader eyebrow="Section 6" title="AI Governance & Risk" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {GOV_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel title="Policy Compliance Trend" description="% adherence, quarterly">
          <div className="h-60">
            <ResponsiveContainer>
              <AreaChart data={COMPLIANCE_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke={COLORS.violet} fill={COLORS.violet} fillOpacity={0.18} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Risk Matrix" description="Open risks by category and severity">
          <div className="grid grid-cols-1 gap-2">
            {RISK_MATRIX.map((r) => {
              const tone = r.sev === "Critical" ? "red" : r.sev === "High" ? "red" : r.sev === "Medium" ? "amber" : "green";
              return (
                <div key={r.cat} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[13px] font-semibold text-slate-900">{r.cat}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-slate-600">{r.count} open</span>
                    <Pill label={r.sev} tone={tone} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}

function Section7FinOps() {
  return (
    <section>
      <SectionHeader eyebrow="Section 7" title="AI Financial Operations" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {FINOPS_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel title="Spend Trend vs Budget" description="$M actuals vs approved budget">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={SPEND_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke={COLORS.amber} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="budget" name="Budget" stroke={COLORS.indigo} strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
        <GlassPanel title="Spend by Portfolio Company" description="$K, last 30 days">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={SPEND_BY_COMPANY}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="company" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="spend" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Optimization Opportunities" description="Ranked by annual savings" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Opportunity</th>
                <th className="py-2">Area</th>
                <th className="py-2">Savings</th>
                <th className="py-2">Complexity</th>
                <th className="py-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {OPTIMIZATIONS.map((o) => (
                <tr key={o.name} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{o.name}</td>
                  <td className="py-2.5 text-slate-700">{o.area}</td>
                  <td className="py-2.5 font-semibold text-emerald-700">{o.savings}</td>
                  <td className="py-2.5"><Pill label={o.complexity} tone={o.complexity === "Low" ? "green" : o.complexity === "Medium" ? "amber" : "red"} /></td>
                  <td className="py-2.5"><Pill label={o.priority} tone={o.priority === "High" ? "red" : o.priority === "Medium" ? "amber" : "slate"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}

function Section8Advisor() {
  return (
    <section>
      <SectionHeader eyebrow="Section 8" title="Architecture Advisor" />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {ADVISOR.map((r) => (
          <div key={r.rec} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 text-blue-600" />
                <div className="text-[14px] font-semibold text-slate-900">{r.rec}</div>
              </div>
              <Pill label={r.prio} tone={r.prio === "High" ? "red" : "amber"} />
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Business Impact</div>
                <div className="mt-0.5 text-[12.5px] text-slate-800">{r.biz}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Technical Impact</div>
                <div className="mt-0.5 text-[12.5px] text-slate-800">{r.tech}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px]">
              <span className="font-semibold text-emerald-700">{r.savings}</span>
              <span className="text-slate-500">Confidence <span className="font-semibold text-slate-700">{r.conf}%</span></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionCTOQuestions() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section>
      <SectionHeader eyebrow="CTO / CIO Lens" title="Executive Questions" />
      <div className="mt-4 space-y-2">
        {CTO_QUESTIONS.map((q, i) => {
          const isOpen = open === i;
          return (
            <div key={q.q} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                <div className="flex items-center gap-2.5">
                  <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <span className="text-sm font-semibold text-slate-900">{q.q}</span>
                </div>
                <Pill label={q.kpi} tone="blue" />
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 px-4 py-3">
                  <p className="text-[13px] leading-relaxed text-slate-700">{q.a}</p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Root Cause</div>
                      <div className="mt-1 text-[12.5px] text-slate-800">{q.rca}</div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-blue-700">Recommended Action</div>
                      <div className="mt-1 text-[12.5px] font-semibold text-blue-800">{q.action}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionDebt() {
  return (
    <section>
      <SectionHeader eyebrow="Tech Debt" title="Technology Optimization Opportunities" />
      <GlassPanel title="Backlog" description="Prioritized engineering investments" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Opportunity</th>
                <th className="py-2">Est. Savings</th>
                <th className="py-2">Engineering Effort</th>
                <th className="py-2">Priority</th>
                <th className="py-2">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {DEBT.map((d) => (
                <tr key={d.name} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{d.name}</td>
                  <td className="py-2.5 font-semibold text-emerald-700">{d.savings}</td>
                  <td className="py-2.5"><Pill label={d.effort} tone={d.effort === "Low" ? "green" : d.effort === "Medium" ? "amber" : "red"} /></td>
                  <td className="py-2.5"><Pill label={d.priority} tone={d.priority === "High" ? "red" : "amber"} /></td>
                  <td className="py-2.5 text-slate-700">{d.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}
