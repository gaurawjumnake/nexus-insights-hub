import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Layers,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Target,
  Gauge,
  ShieldAlert,
  Sparkles,
  Lightbulb,
  ChevronRight,
  Rocket,
  CheckCircle2,
  Clock,
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

export const Route = createFileRoute("/workforce/operations")({
  component: OperationsPersonaView,
});

// ============ Section 1 - Executive Operations KPIs (wired to real data below) ============

// ============ Section 2 - Program Execution ============
const PROGRAM_KPIS = [
  { title: "Total Programs", value: "62", trend: "+11", icon: <Layers className="w-4 h-4" />, accent: COLORS.indigo, footer: "Across 5 PortCos" },
  { title: "On Track", value: "41", trend: "+8", icon: <CheckCircle2 className="w-4 h-4" />, accent: COLORS.green, footer: "66% of portfolio" },
  { title: "At Risk", value: "12", trend: "-3", icon: <AlertTriangle className="w-4 h-4" />, accent: COLORS.amber, footer: "19% of portfolio", trendDirection: "down" as const },
  { title: "Delayed", value: "5", trend: "-2", icon: <Clock className="w-4 h-4" />, accent: COLORS.red, footer: "8% of portfolio", trendDirection: "down" as const },
  { title: "Completed (YTD)", value: "18", trend: "+6", icon: <Target className="w-4 h-4" />, accent: COLORS.teal, footer: "$11.2M benefits" },
  { title: "Prod Deployments", value: "47", trend: "+9", icon: <Rocket className="w-4 h-4" />, accent: COLORS.violet, footer: "Pilot→Prod 71%" },
];

const PROGRAM_STATUS = [
  { name: "Green", value: 41, color: COLORS.green },
  { name: "Amber", value: 16, color: COLORS.amber },
  { name: "Red", value: 5, color: COLORS.red },
];

const DELIVERY_TREND = [
  { p: "Q1'25", velocity: 7, completed: 3, milestones: 18 },
  { p: "Q2'25", velocity: 9, completed: 4, milestones: 24 },
  { p: "Q3'25", velocity: 11, completed: 5, milestones: 31 },
  { p: "Q4'25", velocity: 13, completed: 6, milestones: 38 },
  { p: "Q1'26", velocity: 14, completed: 7, milestones: 42 },
  { p: "Q2'26", velocity: 16, completed: 8, milestones: 47 },
];

const PROGRAM_ROWS = [
  { name: "Sales Copilot", company: "Provation", owner: "M. Chen", stage: "Scale", budget: "$1.4M", completion: 92, risk: "green", value: "$3.8M" },
  { name: "Support Automation", company: "Gordian", owner: "R. Patel", stage: "Production", budget: "$0.9M", completion: 78, risk: "green", value: "$2.4M" },
  { name: "Finance Close AI", company: "Fluke", owner: "L. Garcia", stage: "UAT", budget: "$1.1M", completion: 61, risk: "amber", value: "$1.9M" },
  { name: "Proposal Generator", company: "Novamind", owner: "J. Kim", stage: "Build", budget: "$0.7M", completion: 44, risk: "amber", value: "$1.2M" },
  { name: "Predictive Maintenance", company: "Fluke", owner: "S. Brown", stage: "Pilot", budget: "$1.6M", completion: 28, risk: "red", value: "$4.1M" },
  { name: "HR Onboarding Agent", company: "Catalent", owner: "T. Nguyen", stage: "Discovery", budget: "$0.4M", completion: 14, risk: "amber", value: "$0.8M" },
];

const STAGE_TONE: Record<string, "indigo" | "violet" | "blue" | "amber" | "green" | "teal"> = {
  Discovery: "slate" as any,
  Pilot: "amber",
  Build: "indigo",
  UAT: "violet",
  Production: "teal",
  Scale: "green",
};

// ============ Section 3 - Adoption Rollout ============
const ADOPTION_KPIS = [
  { title: "Active Users", value: "12,840", trend: "+18% MoM", icon: <Users className="w-4 h-4" />, accent: COLORS.teal, footer: "Across PortCos" },
  { title: "Adoption Rate", value: "68%", trend: "+12 pts", icon: <Activity className="w-4 h-4" />, accent: COLORS.green, footer: "Target 75%" },
  { title: "Dept Coverage", value: "82%", trend: "+9 pts", icon: <Layers className="w-4 h-4" />, accent: COLORS.indigo, footer: "11 of 14 functions" },
  { title: "AI Champions", value: "186", trend: "+34", icon: <Sparkles className="w-4 h-4" />, accent: COLORS.violet, footer: "Power users certified" },
  { title: "Training Completion", value: "91%", trend: "+7 pts", icon: <Target className="w-4 h-4" />, accent: COLORS.amber, footer: "Mandatory cohort" },
  { title: "Usage Frequency", value: "4.6/wk", trend: "+0.8", icon: <Gauge className="w-4 h-4" />, accent: COLORS.blue, footer: "Sessions per user" },
];

const ADOPTION_TREND = [
  { p: "Jan", users: 6200, training: 64 },
  { p: "Feb", users: 7400, training: 71 },
  { p: "Mar", users: 8700, training: 76 },
  { p: "Apr", users: 9900, training: 82 },
  { p: "May", users: 11200, training: 87 },
  { p: "Jun", users: 12840, training: 91 },
];

const ADOPTION_BY_COMPANY = [
  { company: "Provation", rate: 84 },
  { company: "Fluke", rate: 74 },
  { company: "Novamind", rate: 67 },
  { company: "Gordian", rate: 62 },
  { company: "Catalent", rate: 48 },
];

const ADOPTION_BY_DEPT = [
  { dept: "Sales", rate: 81 },
  { dept: "Support", rate: 78 },
  { dept: "Marketing", rate: 71 },
  { dept: "Operations", rate: 66 },
  { dept: "Finance", rate: 58 },
  { dept: "HR", rate: 47 },
];

const MATURITY_HEATMAP = [
  { dept: "Sales", Provation: "Optimized", Fluke: "Scaling", Novamind: "Scaling", Gordian: "Developing", Catalent: "Emerging" },
  { dept: "Marketing", Provation: "Scaling", Fluke: "Scaling", Novamind: "Developing", Gordian: "Developing", Catalent: "Emerging" },
  { dept: "Operations", Provation: "Scaling", Fluke: "Optimized", Novamind: "Scaling", Gordian: "Developing", Catalent: "Developing" },
  { dept: "Finance", Provation: "Developing", Fluke: "Scaling", Novamind: "Developing", Gordian: "Emerging", Catalent: "Emerging" },
  { dept: "HR", Provation: "Developing", Fluke: "Developing", Novamind: "Emerging", Gordian: "Emerging", Catalent: "Emerging" },
  { dept: "Customer Support", Provation: "Optimized", Fluke: "Scaling", Novamind: "Scaling", Gordian: "Optimized", Catalent: "Developing" },
];

const MATURITY_COLOR: Record<string, string> = {
  Emerging: "bg-slate-100 text-slate-700",
  Developing: "bg-amber-50 text-amber-700",
  Scaling: "bg-teal-50 text-teal-700",
  Optimized: "bg-emerald-100 text-emerald-700",
};

// ============ Section 4 - Productivity ============
const PRODUCTIVITY_KPIS = [
  { title: "Hours Saved", value: "142k", trend: "+24% QoQ", icon: <Clock className="w-4 h-4" />, accent: COLORS.teal, footer: "YTD across portfolio" },
  { title: "FTE Equivalent", value: "76", trend: "+13", icon: <Users className="w-4 h-4" />, accent: COLORS.indigo, footer: "Capacity unlocked" },
  { title: "Automation Rate", value: "58%", trend: "+9 pts", icon: <Activity className="w-4 h-4" />, accent: COLORS.green, footer: "Of eligible processes" },
  { title: "Cycle Time", value: "-41%", trend: "-6 pts", icon: <Gauge className="w-4 h-4" />, accent: COLORS.amber, footer: "Avg across flows", trendDirection: "down" as const },
  { title: "Process Efficiency", value: "84/100", trend: "+11 pts", icon: <Target className="w-4 h-4" />, accent: COLORS.violet, footer: "Composite index" },
  { title: "Productivity Gain", value: "+31%", trend: "+6 pts", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.blue, footer: "Output / FTE" },
];

const HOURS_TREND = [
  { p: "Q1'25", hours: 38, automation: 38 },
  { p: "Q2'25", hours: 56, automation: 44 },
  { p: "Q3'25", hours: 78, automation: 49 },
  { p: "Q4'25", hours: 96, automation: 52 },
  { p: "Q1'26", hours: 118, automation: 55 },
  { p: "Q2'26", hours: 142, automation: 58 },
];

const PRODUCTIVITY_BY_COMPANY = [
  { company: "Provation", gain: 38 },
  { company: "Fluke", gain: 34 },
  { company: "Novamind", gain: 29 },
  { company: "Gordian", gain: 26 },
  { company: "Catalent", gain: 18 },
];

const PROCESS_RANKING = [
  { process: "Invoice Processing", efficiency: 91, saved: "28k hrs" },
  { process: "Customer Support", efficiency: 88, saved: "41k hrs" },
  { process: "Proposal Creation", efficiency: 82, saved: "19k hrs" },
  { process: "Knowledge Retrieval", efficiency: 79, saved: "32k hrs" },
  { process: "Employee Onboarding", efficiency: 68, saved: "12k hrs" },
];

// ============ Section 5 - Benefits ============
const BENEFITS_KPIS = [
  { title: "Planned Benefits", value: "$19.8M", trend: "FY26", icon: <Target className="w-4 h-4" />, accent: COLORS.indigo, footer: "Approved portfolio" },
  { title: "Realized Benefits", value: "$18.7M", trend: "+14%", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.green, footer: "94% achievement" },
  { title: "Achievement %", value: "94%", trend: "+8 pts", icon: <CheckCircle2 className="w-4 h-4" />, accent: COLORS.teal, footer: "Top Quartile" },
  { title: "ROI", value: "3.6x", trend: "+0.4x", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.violet, footer: "Portfolio-wide" },
  { title: "Payback Period", value: "7.2 mo", trend: "-1.2 mo", icon: <Clock className="w-4 h-4" />, accent: COLORS.amber, footer: "Median", trendDirection: "down" as const },
  { title: "EBITDA Contribution", value: "+10.4pp", trend: "+3.4pp", icon: <Activity className="w-4 h-4" />, accent: COLORS.blue, footer: "From AI initiatives" },
];

const PLANNED_VS_ACTUAL = [
  { p: "Q1'25", planned: 1.8, actual: 1.4 },
  { p: "Q2'25", planned: 2.6, actual: 2.3 },
  { p: "Q3'25", planned: 3.4, actual: 3.1 },
  { p: "Q4'25", planned: 4.2, actual: 4.0 },
  { p: "Q1'26", planned: 4.0, actual: 3.8 },
  { p: "Q2'26", planned: 3.8, actual: 4.1 },
];

const REALIZATION_ROWS = [
  { initiative: "Sales Copilot", company: "Provation", target: "$3.4M", actual: "$3.8M", variance: "+12%", roi: "4.1x", status: "Exceeded" },
  { initiative: "Support Automation", company: "Gordian", target: "$1.9M", actual: "$2.4M", variance: "+26%", roi: "3.8x", status: "Exceeded" },
  { initiative: "Finance Close AI", company: "Fluke", target: "$1.8M", actual: "$1.6M", variance: "-11%", roi: "2.4x", status: "At Risk" },
  { initiative: "Proposal Generator", company: "Novamind", target: "$1.2M", actual: "$0.9M", variance: "-25%", roi: "1.8x", status: "Lagging" },
  { initiative: "Predictive Maintenance", company: "Fluke", target: "$4.1M", actual: "$1.2M", variance: "-71%", roi: "0.9x", status: "At Risk" },
];

// ============ Section 6 - Risk ============
const RISK_KPIS = [
  { title: "High Risk Programs", value: "5", trend: "-2", icon: <AlertTriangle className="w-4 h-4" />, accent: COLORS.red, footer: "8% of portfolio", trendDirection: "down" as const },
  { title: "Budget Overruns", value: "$1.4M", trend: "-$0.6M", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.amber, footer: "Across 4 programs", trendDirection: "down" as const },
  { title: "Delayed Initiatives", value: "5", trend: "-2", icon: <Clock className="w-4 h-4" />, accent: COLORS.violet, footer: "Avg slip 6 wks", trendDirection: "down" as const },
  { title: "Low Adoption Programs", value: "7", trend: "-3", icon: <Users className="w-4 h-4" />, accent: COLORS.indigo, footer: "<40% adoption", trendDirection: "down" as const },
  { title: "Change Resistance", value: "28/100", trend: "-6", icon: <ShieldAlert className="w-4 h-4" />, accent: COLORS.teal, footer: "Lower is better", trendDirection: "down" as const },
];

const RISK_HEATMAP = [
  { category: "Schedule Risk", Provation: "Low", Fluke: "Medium", Novamind: "Medium", Gordian: "Low", Catalent: "High" },
  { category: "Adoption Risk", Provation: "Low", Fluke: "Low", Novamind: "Medium", Gordian: "Medium", Catalent: "High" },
  { category: "Budget Risk", Provation: "Low", Fluke: "High", Novamind: "Low", Gordian: "Medium", Catalent: "Medium" },
  { category: "Resource Risk", Provation: "Medium", Fluke: "Medium", Novamind: "High", Gordian: "Low", Catalent: "High" },
  { category: "Skills Risk", Provation: "Low", Fluke: "Medium", Novamind: "Medium", Gordian: "High", Catalent: "Critical" },
  { category: "Change Mgmt Risk", Provation: "Low", Fluke: "Low", Novamind: "Medium", Gordian: "Medium", Catalent: "High" },
];

const RISK_COLOR: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-rose-50 text-rose-700",
  Critical: "bg-red-100 text-red-800 font-semibold",
};

const ESCALATIONS = [
  { risk: "Skills gap — MLOps", company: "Catalent", program: "Predictive Maintenance", severity: "Critical", impact: "$4.1M at risk", mitigation: "Engage AI CoE; 2 contractor hires Q3" },
  { risk: "Budget overrun 28%", company: "Fluke", program: "Predictive Maintenance", severity: "High", impact: "$0.4M variance", mitigation: "Re-scope to top 3 plants" },
  { risk: "Low end-user adoption", company: "Novamind", program: "Proposal Generator", severity: "High", impact: "Benefit shortfall $0.3M", mitigation: "Champion program + manager incentives" },
  { risk: "UAT defect backlog", company: "Fluke", program: "Finance Close AI", severity: "Medium", impact: "Go-live slip 4 wks", mitigation: "Daily triage; vendor SLA escalation" },
  { risk: "Data quality issues", company: "Gordian", program: "Support Automation", severity: "Medium", impact: "Model accuracy -7%", mitigation: "DQ remediation sprint" },
];

// ============ Section 7 - Transformation ============
const TRANSFORMATION_KPIS = [
  { title: "Transformation Score", value: "74/100", trend: "+11 pts", icon: <Sparkles className="w-4 h-4" />, accent: COLORS.violet, footer: "Composite index" },
  { title: "AI Maturity Growth", value: "+0.8", trend: "Lvl 2.6→3.4", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.indigo, footer: "Last 12 mo" },
  { title: "Prod Scale Rate", value: "71%", trend: "+14 pts", icon: <Rocket className="w-4 h-4" />, accent: COLORS.teal, footer: "Pilot → Production" },
  { title: "Value Realization", value: "94%", trend: "+8 pts", icon: <Target className="w-4 h-4" />, accent: COLORS.green, footer: "Realized / Planned" },
];

const PORTFOLIO_RANKING = [
  { company: "Provation", score: 88 },
  { company: "Fluke", score: 79 },
  { company: "Novamind", score: 71 },
  { company: "Gordian", score: 64 },
  { company: "Catalent", score: 48 },
];

const MATURITY_PROGRESSION = [
  { p: "Q1'25", provation: 2.4, fluke: 2.2, aldevron: 1.9, gordon: 1.7, catalent: 1.4 },
  { p: "Q2'25", provation: 2.7, fluke: 2.5, aldevron: 2.2, gordon: 2.0, catalent: 1.6 },
  { p: "Q3'25", provation: 3.0, fluke: 2.8, aldevron: 2.5, gordon: 2.2, catalent: 1.8 },
  { p: "Q4'25", provation: 3.3, fluke: 3.1, aldevron: 2.8, gordon: 2.4, catalent: 2.0 },
  { p: "Q1'26", provation: 3.6, fluke: 3.3, aldevron: 3.0, gordon: 2.6, catalent: 2.1 },
  { p: "Q2'26", provation: 3.9, fluke: 3.5, aldevron: 3.2, gordon: 2.8, catalent: 2.3 },
];

const SCORECARD = [
  { company: "Provation", score: 88, adoption: 84, prod: 38, value: 96, risk: "Low", status: "Leader" },
  { company: "Fluke", score: 79, adoption: 74, prod: 34, value: 89, risk: "Medium", status: "On Track" },
  { company: "Novamind", score: 71, adoption: 67, prod: 29, value: 82, risk: "Medium", status: "On Track" },
  { company: "Gordian", score: 64, adoption: 62, prod: 26, value: 78, risk: "Medium", status: "Watch" },
  { company: "Catalent", score: 48, adoption: 48, prod: 18, value: 56, risk: "High", status: "Lagging" },
];

// ============ Section 8 - Advisor & Q&A ============
const RECOMMENDATIONS = [
  { title: "Accelerate Support Automation Rollout", company: "Gordian", reason: "Adoption reached 78% and benefits exceed target by 24%.", impact: "Additional $2.3M annual savings", confidence: 92, priority: "High", owner: "R. Patel · COO" },
  { title: "Pause Predictive Maintenance Scale", company: "Fluke", reason: "Skills gap and 28% budget overrun; ROI tracking 0.9x vs 2.4x target.", impact: "Avoid $1.8M further exposure", confidence: 88, priority: "Critical", owner: "S. Brown · VP Eng" },
  { title: "Replicate Sales Copilot Playbook", company: "Novamind + Gordian", reason: "Provation achieved 4.1x ROI; replication potential validated.", impact: "$5.4M cumulative uplift over 18 mo", confidence: 86, priority: "High", owner: "M. Chen · Sales Ops" },
  { title: "Launch Adoption Recovery Plan", company: "Catalent", reason: "Adoption at 48%, lowest in portfolio; change resistance index elevated.", impact: "Lift adoption to 65%; unlock $1.4M", confidence: 79, priority: "High", owner: "T. Nguyen · CHRO" },
  { title: "Consolidate Proposal Tools", company: "Novamind", reason: "Three overlapping tools; usage fragmented; benefits 25% below plan.", impact: "$0.6M savings; +18% productivity", confidence: 81, priority: "Medium", owner: "J. Kim · Rev Ops" },
  { title: "Invest in AI Champion Program", company: "Portfolio", reason: "Companies with champions see 2.1x adoption velocity.", impact: "+12 pts portfolio adoption", confidence: 84, priority: "Medium", owner: "AI CoE" },
  { title: "Standardize Benefits Tracking Cadence", company: "Portfolio", reason: "Variance in reporting; 2 of 5 PortCos missing weekly cadence.", impact: "Improve forecasting accuracy +18%", confidence: 90, priority: "Medium", owner: "PMO" },
];

const PRIORITY_TONE: Record<string, "red" | "amber" | "indigo"> = {
  Critical: "red",
  High: "amber",
  Medium: "indigo",
};

const PARTNER_QUESTIONS = [
  {
    q: "Which programs are behind schedule?",
    a: "5 programs are flagged delayed across 3 PortCos; avg slip 6 weeks. Predictive Maintenance (Fluke) and HR Onboarding Agent (Catalent) are the most material.",
    kpis: ["Delayed: 5", "Avg slip: 6 wks", "Value at risk: $5.3M"],
    root: "Skills gaps in MLOps and weak vendor SLAs are the dominant root causes.",
    action: "Engage AI CoE for skills augmentation; tighten vendor governance with bi-weekly steering.",
    value: "$3.1M recoverable benefit",
  },
  {
    q: "Which company is failing to scale AI?",
    a: "Catalent ranks lowest on transformation score (48/100), adoption (48%) and maturity (Lvl 2.3).",
    kpis: ["Score: 48", "Adoption: 48%", "Prod use cases: 4"],
    root: "Leadership sponsorship gap and limited AI champion network.",
    action: "Appoint executive sponsor; launch 90-day adoption recovery plan with CoE support.",
    value: "Unlock $1.4M near-term benefit",
  },
  {
    q: "Where are adoption issues emerging?",
    a: "HR (47%) and Finance (58%) functions lag; Catalent is bottom-quartile across all functions.",
    kpis: ["HR: 47%", "Finance: 58%", "Catalent overall: 48%"],
    root: "Change management investment under-funded; usability friction in finance tools.",
    action: "Targeted enablement sprints; UX optimization with vendor.",
    value: "+9 pts adoption · $1.1M benefit",
  },
  {
    q: "Which initiatives are not delivering expected value?",
    a: "Predictive Maintenance (Fluke), Proposal Generator (Novamind) and Finance Close AI (Fluke) are tracking below plan.",
    kpis: ["3 initiatives at risk", "$2.5M variance", "Avg ROI 1.7x"],
    root: "Two have skills/data quality issues; one has adoption shortfall.",
    action: "Pause Predictive Maintenance scale; re-baseline Finance Close; champion-led push for Proposal Generator.",
    value: "$1.9M recoverable",
  },
  {
    q: "Where should transformation resources be allocated?",
    a: "Concentrate on replicating proven plays from Provation and Fluke into Gordian and Catalent.",
    kpis: ["Replication potential: $5.4M", "Top 3 plays identified", "Capacity available: 22 FTE"],
    root: "Highest marginal return is in replication, not new pilots.",
    action: "Freeze net-new pilots in Q3; deploy CoE squads to replication.",
    value: "$5.4M over 18 months",
  },
  {
    q: "Which company has the highest execution maturity?",
    a: "Provation leads with transformation score 88, adoption 84%, 38 production use cases and value realization 96%.",
    kpis: ["Score: 88", "Adoption: 84%", "Value: 96%"],
    root: "Strong sponsorship, AI CoE embedded, disciplined benefits tracking.",
    action: "Codify Provation operating model as portfolio playbook.",
    value: "Template for $7M+ portfolio uplift",
  },
  {
    q: "Which programs should be accelerated?",
    a: "Sales Copilot (Provation) and Support Automation (Gordian) are exceeding target; ready to scale.",
    kpis: ["Sales Copilot ROI: 4.1x", "Support Automation: +26% variance", "Scale capacity: 60 days"],
    root: "Proven adoption and benefit overachievement.",
    action: "Pull forward Q4 scale plan to Q3; allocate $0.8M incremental.",
    value: "+$2.6M incremental in FY26",
  },
  {
    q: "Which programs should be stopped?",
    a: "Predictive Maintenance scale phase (Fluke) shows persistent skills gap and ROI <1.0x.",
    kpis: ["ROI: 0.9x", "Overrun: 28%", "Skills gap: Critical"],
    root: "Insufficient MLOps capability + data quality.",
    action: "Pause scale; retain pilot in 1 plant for learning; reinvest $1.8M.",
    value: "Avoid $1.8M further exposure",
  },
];

const PLAYBOOK = [
  { source: "Provation", initiative: "AI Support Automation", result: "34% productivity improvement", target: "Gordian, Fluke", expected: "$3.8M", priority: "High" },
  { source: "Provation", initiative: "Sales Copilot", result: "4.1x ROI · +18% win rate", target: "Novamind, Gordian", expected: "$5.4M", priority: "High" },
  { source: "Fluke", initiative: "Finance Close AI", result: "Cycle -42%", target: "Provation, Novamind", expected: "$2.1M", priority: "Medium" },
  { source: "Gordian", initiative: "Knowledge Retrieval Agent", result: "32k hrs saved", target: "Catalent, Fluke", expected: "$1.6M", priority: "Medium" },
  { source: "Provation", initiative: "Champion Network Model", result: "+22 pts adoption", target: "Portfolio", expected: "+12 pts adoption", priority: "High" },
];

// ============================================
// Component
// ============================================
function OperationsPersonaView() {
  const { companyLabel } = useWorkforce();
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
            Operations Persona · Detail Insights
          </div>
          <h1
            className="mt-1 text-2xl font-semibold text-slate-900"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Transformation Command Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Are AI initiatives being executed effectively and delivering expected outcomes at{" "}
            <span className="font-medium text-slate-700">{companyLabel}</span>?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill label="COO" tone="red" />
          <Pill label="Transformation Office" tone="violet" />
          <Pill label="PMO" tone="indigo" />
          <Pill label="Operating Partners" tone="amber" />
        </div>
      </div>

      <Section1ExecKPIs />
      <Section2Programs />
      <Section3Adoption />
      <Section4Productivity />
      <Section5Benefits />
      <Section6Risk />
      <Section7Transformation />
      <Section8Advisor />
      <SectionPartnerQuestions />
      <SectionPlaybook />
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between border-b border-slate-200 pb-2">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-600">{eyebrow}</div>
        <h2 className="mt-0.5 text-lg font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{title}</h2>
      </div>
    </div>
  );
}

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
    { id: "total_ai_projects", title: "Active AI Programs", icon: <Layers className="w-4 h-4" />, accent: COLORS.indigo },
    { id: "projects_in_production", title: "Production Use Cases", icon: <Rocket className="w-4 h-4" />, accent: COLORS.teal },
    { id: "percent_ai_in_production", title: "Adoption Rate", icon: <Users className="w-4 h-4" />, accent: COLORS.green },
    { id: "cost_savings", title: "Benefits Realized", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.violet },
    { id: "productivity_gain", title: "Productivity Gain", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.amber },
    { id: "stalled_projects", title: "Stalled Projects", icon: <ShieldAlert className="w-4 h-4" />, accent: COLORS.red, trendDirection: "down" as const },
  ];
  return (
    <section>
      <SectionHeader eyebrow="Section 1" title="Executive Operations KPI Summary" />
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

function Section2Programs() {
  return (
    <section>
      <SectionHeader eyebrow="Section 2" title="Portfolio Program Execution" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {PROGRAM_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="Program Status Distribution" description="Green / Amber / Red">
          <div className="h-60">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={PROGRAM_STATUS} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {PROGRAM_STATUS.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Delivery Velocity & Completion" description="Programs delivered per quarter">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={DELIVERY_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="velocity" name="Velocity" fill={COLORS.indigo} radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill={COLORS.green} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Milestone Achievement Trend" description="Cumulative milestones per quarter">
          <div className="h-60">
            <ResponsiveContainer>
              <AreaChart data={DELIVERY_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="milestones" stroke={COLORS.violet} fill={`${COLORS.violet}33`} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Portfolio Program Execution" description="Active programs across portfolio" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Program</th>
                <th className="py-2">Company</th>
                <th className="py-2">Owner</th>
                <th className="py-2">Stage</th>
                <th className="py-2">Budget</th>
                <th className="py-2">Completion</th>
                <th className="py-2">Risk</th>
                <th className="py-2">Expected Value</th>
              </tr>
            </thead>
            <tbody>
              {PROGRAM_ROWS.map((r) => (
                <tr key={r.name} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{r.name}</td>
                  <td className="py-2.5 text-slate-700">{r.company}</td>
                  <td className="py-2.5 text-slate-700">{r.owner}</td>
                  <td className="py-2.5"><Pill label={r.stage} tone={STAGE_TONE[r.stage] as any} /></td>
                  <td className="py-2.5 text-slate-700">{r.budget}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full" style={{ width: `${r.completion}%`, backgroundColor: r.completion > 70 ? COLORS.green : r.completion > 40 ? COLORS.amber : COLORS.red }} />
                      </div>
                      <span className="text-[12px] text-slate-600">{r.completion}%</span>
                    </div>
                  </td>
                  <td className="py-2.5"><Pill label={r.risk === "green" ? "On Track" : r.risk === "amber" ? "Watch" : "At Risk"} tone={r.risk === "green" ? "green" : r.risk === "amber" ? "amber" : "red"} /></td>
                  <td className="py-2.5 font-medium text-slate-900">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}

function Section3Adoption() {
  return (
    <section>
      <SectionHeader eyebrow="Section 3" title="Adoption & Change Management" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {ADOPTION_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="User Growth & Training" description="Monthly active users vs training completion %">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={ADOPTION_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="l" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="r" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="l" type="monotone" dataKey="users" name="Active Users" stroke={COLORS.teal} strokeWidth={2.5} dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="training" name="Training %" stroke={COLORS.amber} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Adoption by Company" description="% of eligible workforce">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={ADOPTION_BY_COMPANY} layout="vertical">
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="company" stroke="#64748b" tick={{ fontSize: 11 }} width={70} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="rate" fill={COLORS.green} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Adoption by Department" description="Portfolio average">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={ADOPTION_BY_DEPT}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="dept" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="rate" fill={COLORS.indigo} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Adoption Maturity Heatmap" description="Department × Company maturity" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2 pr-4">Department</th>
                {["Provation", "Fluke", "Novamind", "Gordian", "Catalent"].map((c) => <th key={c} className="py-2 px-3">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {MATURITY_HEATMAP.map((r) => (
                <tr key={r.dept} className="border-t border-slate-100">
                  <td className="py-2 pr-4 font-semibold text-slate-900">{r.dept}</td>
                  {(["Provation", "Fluke", "Novamind", "Gordian", "Catalent"] as const).map((c) => (
                    <td key={c} className="py-2 px-3">
                      <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${MATURITY_COLOR[(r as any)[c]]}`}>{(r as any)[c]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}

function Section4Productivity() {
  return (
    <section>
      <SectionHeader eyebrow="Section 4" title="Operational Productivity" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {PRODUCTIVITY_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="Hours Saved & Automation Growth" description="Cumulative '000 hrs · automation %">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={HOURS_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="l" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="r" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="l" type="monotone" dataKey="hours" name="Hours ('000)" stroke={COLORS.teal} strokeWidth={2.5} dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="automation" name="Automation %" stroke={COLORS.amber} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Productivity Gain by Company" description="% output uplift per FTE">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={PRODUCTIVITY_BY_COMPANY} layout="vertical">
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="company" stroke="#64748b" tick={{ fontSize: 11 }} width={70} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="gain" fill={COLORS.violet} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Process Efficiency Ranking" description="Top automated processes">
          <div className="space-y-2.5">
            {PROCESS_RANKING.map((p) => (
              <div key={p.process} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-slate-900">{p.process}</span>
                  <span className="text-slate-500">{p.saved}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full" style={{ width: `${p.efficiency}%`, backgroundColor: COLORS.green }} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">{p.efficiency}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}

function Section5Benefits() {
  return (
    <section>
      <SectionHeader eyebrow="Section 5" title="Benefits Realization" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {BENEFITS_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel title="Planned vs Actual Benefits" description="$M per quarter">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={PLANNED_VS_ACTUAL}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="planned" name="Planned" fill={COLORS.indigo} radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill={COLORS.green} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="ROI by Initiative" description="Portfolio-wide benchmark">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={REALIZATION_ROWS.map((r) => ({ name: r.initiative, roi: parseFloat(r.roi) }))} layout="vertical">
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} width={130} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="roi" fill={COLORS.violet} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Benefits Realization Table" description="Target vs Actual by initiative" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Initiative</th>
                <th className="py-2">Company</th>
                <th className="py-2">Target</th>
                <th className="py-2">Actual</th>
                <th className="py-2">Variance</th>
                <th className="py-2">ROI</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {REALIZATION_ROWS.map((r) => (
                <tr key={r.initiative} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{r.initiative}</td>
                  <td className="py-2.5 text-slate-700">{r.company}</td>
                  <td className="py-2.5 text-slate-700">{r.target}</td>
                  <td className="py-2.5 text-slate-700">{r.actual}</td>
                  <td className={`py-2.5 font-medium ${r.variance.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>{r.variance}</td>
                  <td className="py-2.5 text-slate-700">{r.roi}</td>
                  <td className="py-2.5"><Pill label={r.status} tone={r.status === "Exceeded" ? "green" : r.status === "At Risk" ? "amber" : "red"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}

function Section6Risk() {
  return (
    <section>
      <SectionHeader eyebrow="Section 6" title="Transformation Risks & Escalation" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {RISK_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <GlassPanel title="Portfolio Risk Heatmap" description="Risk category × Company" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2 pr-4">Risk Category</th>
                {["Provation", "Fluke", "Novamind", "Gordian", "Catalent"].map((c) => <th key={c} className="py-2 px-3">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {RISK_HEATMAP.map((r) => (
                <tr key={r.category} className="border-t border-slate-100">
                  <td className="py-2 pr-4 font-semibold text-slate-900">{r.category}</td>
                  {(["Provation", "Fluke", "Novamind", "Gordian", "Catalent"] as const).map((c) => (
                    <td key={c} className="py-2 px-3">
                      <span className={`inline-flex rounded-md px-2 py-1 text-[11px] ${RISK_COLOR[(r as any)[c]]}`}>{(r as any)[c]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      <GlassPanel title="Active Escalations" description="Top risks requiring intervention" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Risk</th>
                <th className="py-2">Company</th>
                <th className="py-2">Program</th>
                <th className="py-2">Severity</th>
                <th className="py-2">Impact</th>
                <th className="py-2">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {ESCALATIONS.map((e) => (
                <tr key={e.risk} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{e.risk}</td>
                  <td className="py-2.5 text-slate-700">{e.company}</td>
                  <td className="py-2.5 text-slate-700">{e.program}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${RISK_COLOR[e.severity]}`}>{e.severity}</span>
                  </td>
                  <td className="py-2.5 text-slate-700">{e.impact}</td>
                  <td className="py-2.5 text-slate-600">{e.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}

function Section7Transformation() {
  return (
    <section>
      <SectionHeader eyebrow="Section 7" title="Portfolio Transformation Progress" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRANSFORMATION_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel title="Transformation Score Ranking" description="Composite portfolio score">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={PORTFOLIO_RANKING} layout="vertical">
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <YAxis type="category" dataKey="company" stroke="#64748b" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="score" fill={COLORS.violet} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="AI Maturity Progression" description="Level (1-5) by company over time">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={MATURITY_PROGRESSION}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[1, 5]} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="provation" name="Provation" stroke={COLORS.green} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="fluke" name="Fluke" stroke={COLORS.teal} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="aldevron" name="Novamind" stroke={COLORS.indigo} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="gordon" name="Gordian" stroke={COLORS.amber} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="catalent" name="Catalent" stroke={COLORS.red} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel title="Portfolio Transformation Scorecard" description="Multi-dimensional snapshot" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Company</th>
                <th className="py-2">Transformation</th>
                <th className="py-2">Adoption</th>
                <th className="py-2">Productivity</th>
                <th className="py-2">Value Realization</th>
                <th className="py-2">Risk</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {SCORECARD.map((r) => (
                <tr key={r.company} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{r.company}</td>
                  <td className="py-2.5 text-slate-700">{r.score}/100</td>
                  <td className="py-2.5 text-slate-700">{r.adoption}%</td>
                  <td className="py-2.5 text-slate-700">+{r.prod}%</td>
                  <td className="py-2.5 text-slate-700">{r.value}%</td>
                  <td className="py-2.5"><span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${RISK_COLOR[r.risk]}`}>{r.risk}</span></td>
                  <td className="py-2.5"><Pill label={r.status} tone={r.status === "Leader" ? "green" : r.status === "On Track" ? "teal" : r.status === "Watch" ? "amber" : "red"} /></td>
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
      <SectionHeader eyebrow="Section 8" title="Operating Partner Advisor" />
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {RECOMMENDATIONS.map((r) => (
          <div key={r.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><Lightbulb className="w-4 h-4" /></div>
                <div>
                  <h4 className="text-[15px] font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{r.title}</h4>
                  <div className="mt-0.5 text-[11px] text-slate-500">{r.company} · Owner {r.owner}</div>
                </div>
              </div>
              <Pill label={r.priority} tone={PRIORITY_TONE[r.priority]} />
            </div>
            <p className="mt-3 text-[13px] text-slate-600"><span className="font-medium text-slate-700">Why:</span> {r.reason}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
              <div className="rounded-lg bg-emerald-50 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-emerald-700">Expected Impact</div>
                <div className="mt-0.5 font-semibold text-emerald-900">{r.impact}</div>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-600">Confidence</div>
                <div className="mt-0.5 font-semibold text-slate-900">{r.confidence}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionPartnerQuestions() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section>
      <SectionHeader eyebrow="Q&A" title="Operating Partner Questions" />
      <div className="mt-4 space-y-2">
        {PARTNER_QUESTIONS.map((q, i) => (
          <div key={q.q} className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-[14px] font-medium text-slate-900">{q.q}</span>
              <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${open === i ? "rotate-90" : ""}`} />
            </button>
            {open === i && (
              <div className="border-t border-slate-100 px-4 py-3 space-y-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Answer</div>
                  <p className="mt-1 text-[13px] text-slate-700">{q.a}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.kpis.map((k) => <span key={k} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">{k}</span>)}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-amber-50 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-amber-700">Root Cause</div>
                    <div className="mt-0.5 text-[12px] text-amber-900">{q.root}</div>
                  </div>
                  <div className="rounded-lg bg-indigo-50 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-indigo-700">Recommended Action</div>
                    <div className="mt-0.5 text-[12px] text-indigo-900">{q.action}</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700">Estimated Value</div>
                    <div className="mt-0.5 text-[12px] font-semibold text-emerald-900">{q.value}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionPlaybook() {
  return (
    <section>
      <SectionHeader eyebrow="PE Playbook" title="Replication & Scale Opportunities" />
      <GlassPanel className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2">Source Company</th>
                <th className="py-2">Initiative</th>
                <th className="py-2">Proven Result</th>
                <th className="py-2">Target Company</th>
                <th className="py-2">Expected Benefit</th>
                <th className="py-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {PLAYBOOK.map((p) => (
                <tr key={p.initiative} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold text-slate-900">{p.source}</td>
                  <td className="py-2.5 text-slate-700">{p.initiative}</td>
                  <td className="py-2.5 text-slate-700">{p.result}</td>
                  <td className="py-2.5 text-slate-700">{p.target}</td>
                  <td className="py-2.5 font-medium text-emerald-700">{p.expected}</td>
                  <td className="py-2.5"><Pill label={p.priority} tone={PRIORITY_TONE[p.priority]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </section>
  );
}
