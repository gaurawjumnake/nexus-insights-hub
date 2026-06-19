import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Target,
  Clock,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Trophy,
  Briefcase,
  Megaphone,
  Headphones,
  Calculator,
  Cog,
  UserCog,
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
  ComposedChart,
} from "recharts";
import { COLORS, GlassPanel, KpiCard, Pill } from "@/components/workforce/ui";
import { useWorkforce } from "@/lib/workforce-context";
import { selectContextKpis, usePortfolioKpis } from "@/hooks/usePortfolioKpis";

export const Route = createFileRoute("/workforce/business")({
  component: BusinessPersonaView,
});

// ---------- Section 1: Executive KPIs (live from API) ----------
const EXEC_KPI_DEFS: { id: string; title: string; icon: React.ReactNode; accent: string }[] = [
  { id: "ai_revenue", title: "AI Revenue", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.teal },
  { id: "cost_savings", title: "Cost Savings", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.green },
  { id: "ebitda_uplift", title: "EBITDA Uplift", icon: <Percent className="w-4 h-4" />, accent: COLORS.indigo },
  { id: "ai_roi", title: "AI ROI", icon: <Target className="w-4 h-4" />, accent: COLORS.violet },
  { id: "payback_period", title: "Payback Period", icon: <Clock className="w-4 h-4" />, accent: COLORS.amber },
  { id: "pipeline_influenced_revenue", title: "Pipeline Influenced Revenue", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.blue },
];

// ---------- Section 2: Revenue ----------
const REV_KPIS = [
  { title: "Direct AI Revenue", value: "$9.4M", trend: "+41% YoY", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.teal, footer: "AI-native products & services" },
  { title: "AI Assisted Revenue", value: "$8.1M", trend: "+22% YoY", icon: <Sparkles className="w-4 h-4" />, accent: COLORS.indigo, footer: "Copilot-augmented deals" },
  { title: "Pipeline Influenced Revenue", value: "$31.2M", trend: "+38% YoY", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.violet, footer: "Open opportunities" },
  { title: "Upsell / Cross-Sell Revenue", value: "$5.2M", trend: "+19% YoY", icon: <Trophy className="w-4 h-4" />, accent: COLORS.green, footer: "Driven by AI signals" },
];

const REV_TREND_MONTHLY = [
  { p: "Jan", direct: 0.5, assisted: 0.4 }, { p: "Feb", direct: 0.6, assisted: 0.5 },
  { p: "Mar", direct: 0.7, assisted: 0.55 }, { p: "Apr", direct: 0.75, assisted: 0.6 },
  { p: "May", direct: 0.8, assisted: 0.65 }, { p: "Jun", direct: 0.85, assisted: 0.7 },
  { p: "Jul", direct: 0.9, assisted: 0.72 }, { p: "Aug", direct: 0.95, assisted: 0.74 },
  { p: "Sep", direct: 1.0, assisted: 0.78 }, { p: "Oct", direct: 1.05, assisted: 0.82 },
  { p: "Nov", direct: 1.1, assisted: 0.85 }, { p: "Dec", direct: 1.15, assisted: 0.9 },
];
const REV_TREND_QUARTERLY = [
  { p: "Q1", direct: 1.8, assisted: 1.45 }, { p: "Q2", direct: 2.4, assisted: 1.95 },
  { p: "Q3", direct: 2.85, assisted: 2.24 }, { p: "Q4", direct: 3.3, assisted: 2.57 },
];
const REV_TREND_ANNUAL = [
  { p: "2022", direct: 4.1, assisted: 3.2 }, { p: "2023", direct: 6.6, assisted: 5.2 },
  { p: "2024", direct: 9.4, assisted: 8.1 },
];

const REV_BY_COMPANY = [
  { company: "Provation", value: 7.2 },
  { company: "Fluke", value: 5.4 },
  { company: "Gordian", value: 4.1 },
  { company: "Novamind", value: 3.6 },
  { company: "Catalent", value: 2.4 },
];

const REV_BY_USECASE = [
  { name: "Sales Copilot", value: 6.8 },
  { name: "Customer Support Agent", value: 4.9 },
  { name: "Proposal Automation", value: 3.7 },
  { name: "Marketing Content Studio", value: 4.2 },
  { name: "Knowledge Assistant", value: 3.1 },
];

const REV_BREAKDOWN = [
  { name: "Sales", value: 38, color: COLORS.teal },
  { name: "Marketing", value: 22, color: COLORS.indigo },
  { name: "Customer Service", value: 18, color: COLORS.violet },
  { name: "Finance", value: 10, color: COLORS.amber },
  { name: "Operations", value: 12, color: COLORS.blue },
];

// ---------- Section 3: EBITDA ----------
const EBITDA_KPIS = [
  { title: "EBITDA Uplift", value: "$14.3M", trend: "+34%", icon: <Percent className="w-4 h-4" />, accent: COLORS.green, footer: "vs prior cycle" },
  { title: "Margin Expansion", value: "+3.8 pts", trend: "+1.4 pts", icon: <TrendingUp className="w-4 h-4" />, accent: COLORS.teal, footer: "Portfolio weighted" },
  { title: "Operating Leverage", value: "2.4x", trend: "+0.6x", icon: <Target className="w-4 h-4" />, accent: COLORS.indigo, footer: "Revenue / OpEx delta" },
  { title: "Cost Takeout", value: "$8.6M", trend: "+22%", icon: <DollarSign className="w-4 h-4" />, accent: COLORS.violet, footer: "Annualized run-rate" },
];

const EBITDA_BY_COMPANY = [
  { company: "Provation", value: 4.3 },
  { company: "Fluke", value: 3.4 },
  { company: "Gordian", value: 2.6 },
  { company: "Novamind", value: 2.2 },
  { company: "Catalent", value: 1.8 },
];

const MARGIN_TREND = [
  { p: "Q1'24", margin: 18.4 }, { p: "Q2'24", margin: 19.1 },
  { p: "Q3'24", margin: 20.0 }, { p: "Q4'24", margin: 20.8 },
  { p: "Q1'25", margin: 21.6 }, { p: "Q2'25", margin: 22.2 },
];

const COST_VS_VALUE = [
  { p: "Q1", cost: 1.2, value: 2.4 }, { p: "Q2", cost: 1.4, value: 3.1 },
  { p: "Q3", cost: 1.6, value: 4.0 }, { p: "Q4", cost: 1.8, value: 4.8 },
];

const ROI_COMPARE = [
  { company: "Provation", roi: 5.1 }, { company: "Fluke", roi: 4.3 },
  { company: "Gordian", roi: 3.8 }, { company: "Novamind", roi: 3.4 },
  { company: "Catalent", roi: 2.6 },
];

const WATERFALL = [
  { name: "Revenue Gain", value: 22.7, color: COLORS.teal },
  { name: "Cost Reduction", value: 8.6, color: COLORS.indigo },
  { name: "Investment", value: -7.4, color: COLORS.amber },
  { name: "Wins-EBITDA", value: 14.3, color: COLORS.green },
];

// ---------- Section 4: Functional ----------
type Fn = { id: string; name: string; icon: React.ReactNode; trend: string; bench: string; tone: "teal" | "indigo" | "violet" | "amber" | "blue" | "green"; metrics: { k: string; v: string; t: string }[] };
const FUNCTIONS: Fn[] = [
  { id: "sales", name: "Sales", icon: <Briefcase className="w-4 h-4" />, trend: "+22% productivity", bench: "Top Quartile", tone: "teal",
    metrics: [
      { k: "Lead Conversion Rate", v: "31%", t: "+6 pts" },
      { k: "Win Rate", v: "44%", t: "+8 pts" },
      { k: "Sales Cycle Reduction", v: "-18 days", t: "-21%" },
      { k: "Revenue Per Rep", v: "$1.42M", t: "+24%" },
      { k: "Proposal Automation Usage", v: "78%", t: "+34 pts" },
    ] },
  { id: "marketing", name: "Marketing", icon: <Megaphone className="w-4 h-4" />, trend: "+38% content velocity", bench: "Top Quartile", tone: "indigo",
    metrics: [
      { k: "Campaign ROI", v: "4.6x", t: "+1.2x" },
      { k: "Content Production Velocity", v: "+312%", t: "vs baseline" },
      { k: "Lead Generation Growth", v: "+41%", t: "YoY" },
      { k: "CAC Reduction", v: "-19%", t: "vs LY" },
    ] },
  { id: "support", name: "Customer Support", icon: <Headphones className="w-4 h-4" />, trend: "-42% resolution time", bench: "Top Quartile", tone: "violet",
    metrics: [
      { k: "Ticket Resolution Time", v: "2.4 h", t: "-42%" },
      { k: "First Contact Resolution", v: "74%", t: "+11 pts" },
      { k: "CSAT Improvement", v: "+9 pts", t: "to 86" },
      { k: "Automation Rate", v: "58%", t: "+22 pts" },
    ] },
  { id: "finance", name: "Finance", icon: <Calculator className="w-4 h-4" />, trend: "-31% close cycle", bench: "Median", tone: "amber",
    metrics: [
      { k: "Invoice Processing Automation", v: "82%", t: "+27 pts" },
      { k: "Close Cycle Reduction", v: "-31%", t: "6 → 4 days" },
      { k: "Cost Reduction", v: "$2.1M", t: "annualized" },
      { k: "Productivity Improvement", v: "+28%", t: "FTE output" },
    ] },
  { id: "ops", name: "Operations", icon: <Cog className="w-4 h-4" />, trend: "+24% throughput", bench: "Top Quartile", tone: "blue",
    metrics: [
      { k: "Cycle Time Reduction", v: "-26%", t: "vs LY" },
      { k: "Process Automation", v: "63%", t: "+18 pts" },
      { k: "Throughput Increase", v: "+24%", t: "units/hr" },
      { k: "Quality Improvement", v: "+12 pts", t: "first pass yield" },
    ] },
  { id: "hr", name: "HR", icon: <UserCog className="w-4 h-4" />, trend: "-29% hiring cycle", bench: "Median", tone: "green",
    metrics: [
      { k: "Hiring Cycle Reduction", v: "-29%", t: "44 → 31 days" },
      { k: "Recruiter Productivity", v: "+38%", t: "reqs/recruiter" },
      { k: "AI Adoption", v: "61%", t: "+19 pts" },
      { k: "Employee Self-Service Usage", v: "72%", t: "+26 pts" },
    ] },
];

// ---------- Section 5: Replication ----------
const REPLICATION = [
  { source: "Provation", useCase: "Sales Copilot", benefit: "+22% Sales Productivity", target: "Gordian", ebitda: "$3.4M", roi: "3.8x", priority: "High", score: 92 },
  { source: "Fluke", useCase: "Proposal Automation", benefit: "+31% Proposal Velocity", target: "Provation", ebitda: "$1.9M", roi: "2.6x", priority: "Medium", score: 78 },
  { source: "Novamind", useCase: "Customer Support Agent", benefit: "-42% Resolution Time", target: "Catalent", ebitda: "$2.4M", roi: "3.1x", priority: "High", score: 88 },
  { source: "Provation", useCase: "Knowledge Assistant", benefit: "+34% Agent Self-Serve", target: "Fluke", ebitda: "$1.2M", roi: "2.2x", priority: "Medium", score: 71 },
  { source: "Gordian", useCase: "Marketing Content Studio", benefit: "+312% Content Velocity", target: "Novamind", ebitda: "$1.6M", roi: "2.9x", priority: "High", score: 84 },
  { source: "Catalent", useCase: "Finance Close Automation", benefit: "-31% Close Cycle", target: "Gordian", ebitda: "$1.1M", roi: "2.4x", priority: "Low", score: 64 },
];

// ---------- Section 6: Advisor & Opportunities ----------
const ADVISOR_RECS = [
  { title: "Expand Sales Copilot Program", rationale: "Provation achieved 22% sales productivity gains. Deploying across Gordian and Fluke is expected to generate $4.2M incremental EBITDA.", value: "+$4.2M EBITDA", confidence: 91, priority: "High" },
  { title: "Standardize Proposal Automation", rationale: "Fluke's proposal velocity uplift (+31%) can be replicated at Provation and Novamind with shared template library and 6-week deployment.", value: "+$3.1M EBITDA", confidence: 87, priority: "High" },
  { title: "Deploy Customer Support Agent at Catalent", rationale: "Novamind's agent reduced resolution time 42% and lifted CSAT 9 pts. Catalent's ticket volume profile is near-identical.", value: "+$2.4M EBITDA", confidence: 84, priority: "High" },
  { title: "Consolidate Marketing Content Studio", rationale: "Gordian's content engine ran 3x cheaper than peer stacks. Migrate Fluke and Novamind onto the shared instance.", value: "-$1.2M OpEx", confidence: 79, priority: "Medium" },
  { title: "Roll out Finance Close Automation", rationale: "Catalent's 31% close-cycle reduction translates directly to working-capital release across the portfolio.", value: "+$1.8M EBITDA", confidence: 76, priority: "Medium" },
  { title: "Launch Cross-Portfolio Knowledge Graph", rationale: "Pooled tacit knowledge unlocks asymmetric value in newly acquired companies; estimated 6-month onboarding compression.", value: "+$2.6M EBITDA", confidence: 68, priority: "Medium" },
  { title: "Sunset Underused Copilot Licenses", rationale: "23% of seats inactive >60 days. Reallocation reduces license spend with no productivity drag.", value: "-$0.9M OpEx", confidence: 92, priority: "Low" },
];

const OPPORTUNITIES = [
  { name: "Sales Copilot Expansion", company: "Gordian, Fluke", ebitda: "$4.2M", roi: "3.9x", difficulty: "Low" },
  { name: "AI Proposal Automation", company: "Provation, Novamind", ebitda: "$3.1M", roi: "2.8x", difficulty: "Medium" },
  { name: "Support Automation", company: "Catalent", ebitda: "$2.4M", roi: "3.1x", difficulty: "Low" },
  { name: "Finance Automation", company: "Gordian", ebitda: "$1.8M", roi: "2.4x", difficulty: "Medium" },
  { name: "Knowledge Management Agent", company: "Portfolio-wide", ebitda: "$2.6M", roi: "2.2x", difficulty: "High" },
];

const PE_QUESTIONS = [
  { q: "Which portfolio company generates the highest AI ROI?", a: "Provation leads at 5.1x ROI, driven by Sales Copilot and Knowledge Assistant adoption across 78% of revenue-facing roles.", kpi: "ROI 5.1x · EBITDA $4.3M", action: "Position Provation's enablement squad as the portfolio Center of Excellence.", value: "$1.4M coordination value" },
  { q: "Which AI initiative should receive additional investment?", a: "Sales Copilot has the highest marginal ROI with 3-month payback at Gordian and Fluke. Doubling the deployment budget compresses time-to-value by ~40%.", kpi: "Marginal ROI 6.8x", action: "Approve $1.2M expansion package in next operating committee.", value: "+$4.2M EBITDA in 12 mo" },
  { q: "Which use case should be replicated next?", a: "Customer Support Agent. Novamind's playbook is well-documented and Catalent's volume profile is the closest match in the portfolio.", kpi: "Replication score 88", action: "Kick off 8-week deployment at Catalent.", value: "+$2.4M EBITDA" },
  { q: "Which company is underperforming against peers?", a: "Catalent trails on AI adoption (28% vs portfolio 46%) and AI-attributed revenue ($2.4M vs $4.5M median).", kpi: "Adoption gap -18 pts", action: "Assign portfolio AI Operating Partner for 90-day intervention.", value: "$3.6M closing-the-gap upside" },
  { q: "Where is the largest EBITDA opportunity?", a: "Sales motion. $4.2M unlocked by replicating Provation's Copilot pattern across Gordian and Fluke alone.", kpi: "Function · Sales", action: "Make Sales Copilot a portfolio-wide mandate this fiscal year.", value: "+$4.2M EBITDA" },
  { q: "Which business function is creating the most value?", a: "Sales contributes 38% of AI-attributed revenue, followed by Marketing (22%) and Customer Service (18%).", kpi: "Sales share 38%", action: "Allocate 50% of net-new AI investment to revenue-facing functions.", value: "Disproportionate value flow" },
];

// ============================================================

function BusinessPersonaView() {
  const { companyLabel } = useWorkforce();
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">Business Persona · Detail Insights</div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Value Creation Cockpit
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            How is AI creating business value across <span className="font-medium text-slate-700">{companyLabel}</span>?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill label="Portfolio CEOs" tone="teal" />
          <Pill label="Operating Partners" tone="indigo" />
          <Pill label="Commercial Leaders" tone="violet" />
        </div>
      </div>

      <Section1ExecKPIs />
      <Section2Revenue />
      <Section3Ebitda />
      <Section4Functional />
      <Section5Replication />
      <Section6Advisor />
      <SectionPEQuestions />
    </div>
  );
}

// ---------------- Section 1 ----------------
function Section1ExecKPIs() {
  const { company, period } = useWorkforce();
  const portfolio = usePortfolioKpis(period);
  const kpis = selectContextKpis(portfolio, company);
  return (
    <section>
      <SectionHeader eyebrow="Section 1" title="Executive KPI Summary" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {EXEC_KPI_DEFS.map((k) => (
          <KpiCard
            key={k.id}
            title={k.title}
            value={kpis[k.id]?.display ?? "No data"}
            icon={k.icon}
            accent={k.accent}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------- Section 2 ----------------
function Section2Revenue() {
  const [grain, setGrain] = useState<"M" | "Q" | "A">("Q");
  const trendData = grain === "M" ? REV_TREND_MONTHLY : grain === "Q" ? REV_TREND_QUARTERLY : REV_TREND_ANNUAL;
  return (
    <section>
      <SectionHeader eyebrow="Section 2" title="Revenue & Growth Impact" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REV_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel
          title="Revenue Trend Over Time"
          description="AI-direct vs AI-assisted revenue ($M)"
          action={
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium">
              {([["M","Monthly"],["Q","Quarterly"],["A","Annual"]] as const).map(([id, lbl]) => (
                <button key={id} onClick={() => setGrain(id)}
                  className={`px-2.5 py-1 rounded ${grain===id ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {lbl}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="direct" name="AI Direct" stroke={COLORS.teal} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="assisted" name="AI Assisted" stroke={COLORS.indigo} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Revenue by Portfolio Company" description="AI-attributed revenue ($M)">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={REV_BY_COMPANY} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="company" stroke="#64748b" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="value" fill={COLORS.teal} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <GlassPanel title="Revenue by AI Use Case" description="$M attributed last 12 mo" className="lg:col-span-3">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={REV_BY_USECASE}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="value" fill={COLORS.indigo} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Contribution by Function" description="% of AI revenue" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={REV_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {REV_BREAKDOWN.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}

// ---------------- Section 3 ----------------
function Section3Ebitda() {
  return (
    <section>
      <SectionHeader eyebrow="Section 3" title="Profitability & Margin Expansion" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EBITDA_KPIS.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel title="EBITDA Impact by Company" description="$M attributed to AI initiatives">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={EBITDA_BY_COMPANY}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="company" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="value" fill={COLORS.green} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="Margin Expansion Trend" description="Portfolio-weighted EBITDA margin %">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={MARGIN_TREND}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[16, 24]} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="margin" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="AI Cost vs Business Value" description="Quarterly run-rate ($M)">
          <div className="h-60">
            <ResponsiveContainer>
              <ComposedChart data={COST_VS_VALUE}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="p" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="cost" name="AI Cost" fill={COLORS.amber} radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="value" name="Business Value" stroke={COLORS.green} strokeWidth={2.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel title="ROI Comparison Across Portfolio" description="AI program ROI multiple">
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={ROI_COMPARE} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="company" stroke="#64748b" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="roi" fill={COLORS.violet} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <div className="mt-4">
        <GlassPanel title="Revenue Gain + Cost Reduction = EBITDA Impact" description="Portfolio waterfall — last 12 months">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {WATERFALL.map((w, i) => (
              <div key={w.name} className="relative flex items-center">
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{w.name}</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-semibold" style={{ color: w.color, fontFamily: "Outfit, sans-serif" }}>
                      {w.value < 0 ? "-" : "+"}${Math.abs(w.value).toFixed(1)}M
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white">
                    <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.abs(w.value) * 4)}%`, backgroundColor: w.color }} />
                  </div>
                </div>
                {i < WATERFALL.length - 1 && (
                  <ArrowRight className="mx-1 h-4 w-4 shrink-0 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}

// ---------------- Section 4 ----------------
function Section4Functional() {
  const [open, setOpen] = useState<string | null>("sales");
  return (
    <section>
      <SectionHeader eyebrow="Section 4" title="Functional Impact Scorecards" />
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {FUNCTIONS.map((f) => {
          const isOpen = open === f.id;
          return (
            <div key={f.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#f1f5f9", color: "#0f172a" }}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{f.name}</div>
                    <div className="text-[11px] text-slate-500">{f.trend}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill label={f.bench} tone={f.tone} />
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 px-4 py-3">
                  <div className="grid grid-cols-1 gap-2">
                    {f.metrics.map((m) => (
                      <div key={m.k} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <div className="text-[12px] text-slate-600">{m.k}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-slate-900">{m.v}</span>
                          <span className="text-[11px] font-medium text-emerald-600">{m.t}</span>
                        </div>
                      </div>
                    ))}
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

// ---------------- Section 5 ----------------
function Section5Replication() {
  return (
    <section>
      <SectionHeader eyebrow="Section 5" title="Cross-Portfolio Replication Opportunities" />
      <GlassPanel
        title="Proven plays ready to replicate"
        description="Successful AI initiatives mapped to high-fit target companies"
        className="mt-4"
        action={<Pill label="PE Operating Lens" tone="teal" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Use Case</th>
                <th className="py-2 pr-3">Proven Benefit</th>
                <th className="py-2 pr-3">Recommended Target</th>
                <th className="py-2 pr-3">Expected EBITDA</th>
                <th className="py-2 pr-3">Expected ROI</th>
                <th className="py-2 pr-3">Replication Score</th>
                <th className="py-2 pr-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {REPLICATION.map((r) => (
                <tr key={r.source + r.useCase} className="border-t border-slate-100">
                  <td className="py-3 pr-3 font-medium text-slate-900">{r.source}</td>
                  <td className="py-3 pr-3 text-slate-700">{r.useCase}</td>
                  <td className="py-3 pr-3 text-emerald-700">{r.benefit}</td>
                  <td className="py-3 pr-3 text-slate-700">{r.target}</td>
                  <td className="py-3 pr-3 font-semibold text-slate-900">{r.ebitda}</td>
                  <td className="py-3 pr-3 text-slate-700">{r.roi}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full" style={{ width: `${r.score}%`, backgroundColor: r.score > 80 ? COLORS.green : r.score > 70 ? COLORS.teal : COLORS.amber }} />
                      </div>
                      <span className="text-[12px] font-medium text-slate-700">{r.score}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <Pill label={r.priority} tone={r.priority === "High" ? "red" : r.priority === "Medium" ? "amber" : "slate"} />
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

// ---------------- Section 6 ----------------
function Section6Advisor() {
  return (
    <section>
      <SectionHeader eyebrow="Section 6" title="Business Advisor" />
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {ADVISOR_RECS.map((r) => (
            <div key={r.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "#f0fdfa", color: COLORS.teal }}>
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{r.title}</div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{r.rationale}</p>
                  </div>
                </div>
                <Pill label={r.priority} tone={r.priority === "High" ? "red" : r.priority === "Medium" ? "amber" : "slate"} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-[11px]">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">{r.value}</span>
                <span className="text-slate-500">Confidence</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-24 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${r.confidence}%` }} />
                  </div>
                  <span className="font-semibold text-slate-700">{r.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <GlassPanel title="Top Value Creation Opportunities" description="Ranked by expected EBITDA" className="self-start">
          <div className="space-y-2.5">
            {OPPORTUNITIES.map((o, i) => (
              <div key={o.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[11px] font-bold text-teal-700 ring-1 ring-slate-200">{i + 1}</span>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">{o.name}</div>
                      <div className="text-[11px] text-slate-500">{o.company}</div>
                    </div>
                  </div>
                  <Pill label={o.difficulty} tone={o.difficulty === "Low" ? "green" : o.difficulty === "Medium" ? "amber" : "red"} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-700">{o.ebitda}</span>
                  <span className="text-slate-600">ROI {o.roi}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}

// ---------------- PE Operating Partner Questions ----------------
function SectionPEQuestions() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section>
      <SectionHeader eyebrow="Operating Partner Lens" title="PE Operating Partner Questions" />
      <div className="mt-4 space-y-2">
        {PE_QUESTIONS.map((q, i) => {
          const isOpen = open === i;
          return (
            <div key={q.q} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                <div className="flex items-center gap-2.5">
                  <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <span className="text-sm font-semibold text-slate-900">{q.q}</span>
                </div>
                <Pill label={q.kpi} tone="teal" />
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 px-4 py-3">
                  <p className="text-[13px] leading-relaxed text-slate-700">{q.a}</p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Suggested Action</div>
                      <div className="mt-1 text-[12.5px] text-slate-800">{q.action}</div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-emerald-700">Estimated Value</div>
                      <div className="mt-1 text-[12.5px] font-semibold text-emerald-800">{q.value}</div>
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

// ---------------- helpers ----------------
function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between border-b border-slate-200 pb-2">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-600">{eyebrow}</div>
        <h2 className="mt-0.5 text-lg font-semibold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{title}</h2>
      </div>
    </div>
  );
}
