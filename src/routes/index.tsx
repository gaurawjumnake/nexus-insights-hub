import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  Download,
  Plus,
  Trash2,
  ChevronDown,
  Globe,
  BarChart3,
  Info,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus — PE AI Observability Tower" },
      {
        name: "description",
        content:
          "Nexus Observatory: unified AI observability across portfolio companies for CXOs, business, technology and operations leaders.",
      },
    ],
  }),
  component: NexusDashboard,
});

type Persona = "cxo" | "business" | "technology" | "operations";
type SubTab = "all" | "revenue" | "ebitda" | "adoption" | "risk" | "efficiency";

const PERSONAS: { id: Persona; label: string; dot: string }[] = [
  { id: "cxo", label: "CXO", dot: "bg-teal-400" },
  { id: "business", label: "Business", dot: "bg-emerald-500" },
  { id: "technology", label: "Technology", dot: "bg-blue-500" },
  { id: "operations", label: "Operations", dot: "bg-rose-500" },
];

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "revenue", label: "Revenue" },
  { id: "ebitda", label: "EBITDA" },
  { id: "adoption", label: "Adoption" },
  { id: "risk", label: "Risk" },
  { id: "efficiency", label: "Efficiency" },
];

type Row = { label: string; value: string; delta?: string; deltaTone?: "up" | "down" | "neutral" };

type Tile = {
  category: SubTab;
  tag: string;
  tagTone: "revenue" | "ebitda" | "adoption" | "risk" | "finops" | "reliability" | "bench";
  title: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down";
  desc?: string;
  rows?: Row[];
  footnote?: string;
  accent: "teal" | "emerald" | "blue" | "rose" | "violet" | "amber" | "slate";
};

const tagStyles: Record<Tile["tagTone"], string> = {
  revenue: "bg-emerald-50 text-emerald-700",
  ebitda: "bg-blue-50 text-blue-700",
  adoption: "bg-teal-50 text-teal-700",
  risk: "bg-rose-50 text-rose-700",
  finops: "bg-amber-50 text-amber-700",
  reliability: "bg-violet-50 text-violet-700",
  bench: "bg-slate-100 text-slate-700",
};

const accentBar: Record<Tile["accent"], string> = {
  teal: "bg-teal-400",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  amber: "bg-amber-400",
  slate: "bg-slate-400",
};

// ---------- KPI tile data per persona ----------
const TILES: Record<Persona, { sectionTitle: string; tiles: Tile[] }[]> = {
  cxo: [
    {
      sectionTitle: "Revenue & Growth",
      tiles: [
        {
          category: "revenue", tag: "REVENUE", tagTone: "revenue", accent: "teal",
          title: "AI-Attributed Revenue", value: "$22.7M", delta: "+28%", deltaTone: "up",
          desc: "Total incremental revenue generated from AI initiatives across the portfolio.",
          rows: [
            { label: "Direct AI Revenue", value: "$14.1M", delta: "+30%", deltaTone: "up" },
            { label: "AI-Assisted Revenue", value: "$6.4M", delta: "+22%", deltaTone: "up" },
            { label: "Pipeline Influenced", value: "$18.9M", delta: "+45%", deltaTone: "up" },
          ],
        },
        {
          category: "revenue", tag: "REVENUE", tagTone: "revenue", accent: "teal",
          title: "AI ROI (Portfolio-wide)", value: "3.6x", delta: "+0.4x", deltaTone: "up",
          desc: "Net return on total AI investment — key LP reporting metric.",
          rows: [
            { label: "By PortCo (Avg)", value: "3.6x", delta: "+12%", deltaTone: "up" },
            { label: "By Use Case (Ops Focus)", value: "4.1x", delta: "+18%", deltaTone: "up" },
            { label: "Payback Period", value: "7.2mo", delta: "-1.2mo", deltaTone: "up" },
          ],
        },
        {
          category: "revenue", tag: "REVENUE", tagTone: "revenue", accent: "teal",
          title: "AI Valuation Multiplier Impact", value: "+1.6x", delta: "+0.2x", deltaTone: "up",
          desc: "Estimated EV/EBITDA multiple uplift derived from AI maturity and capability premium.",
          rows: [
            { label: "Tech Stack Premium", value: "+0.9x" },
            { label: "Operating Efficiency Uplift", value: "+0.5x" },
            { label: "Governance/Risk Discount Reduction", value: "+0.2x" },
          ],
        },
      ],
    },
    {
      sectionTitle: "EBITDA & Cost Management",
      tiles: [
        {
          category: "ebitda", tag: "FINOPS", tagTone: "finops", accent: "teal",
          title: "Total AI Spend vs Budget", value: "92%", delta: "-8%", deltaTone: "down",
          desc: "Aggregate AI operational spend versus approved capital allocation budget.",
          rows: [
            { label: "Infrastructure / Cloud", value: "$2.1M", delta: "-8%", deltaTone: "down" },
            { label: "Talent / AI Teams", value: "$3.4M", delta: "+2%", deltaTone: "up" },
            { label: "Licensing / API", value: "$0.9M", delta: "-14%", deltaTone: "down" },
          ],
          footnote: "Actual AI Spend / Approved AI Budget",
        },
        {
          category: "ebitda", tag: "EBITDA", tagTone: "ebitda", accent: "teal",
          title: "AI EBITDA Uplift (pp)", value: "+10.4pp", delta: "+3.4pp", deltaTone: "up",
          desc: "EBITDA margin improvement from AI-driven cost reduction and process efficiency.",
          rows: [
            { label: "Cost Automation", value: "+4.8pp", delta: "+1.6pp", deltaTone: "up" },
            { label: "Headcount Efficiency", value: "+3.2pp", delta: "+1.1pp", deltaTone: "up" },
            { label: "Process Optimization", value: "+2.4pp", delta: "+0.7pp", deltaTone: "up" },
          ],
        },
        {
          category: "ebitda", tag: "FINOPS", tagTone: "finops", accent: "teal",
          title: "Cost per Outcome (Unit Economics)", value: "$0.42", delta: "-12%", deltaTone: "down",
          desc: "Average cost of AI inference/processing per successful business outcome.",
          rows: [
            { label: "Current Avg Cost", value: "$0.42" },
            { label: "Forecasted (Next Q)", value: "$0.38", delta: "-9%", deltaTone: "down" },
            { label: "Efficiency Gain (YoY)", value: "34%" },
          ],
        },
      ],
    },
    {
      sectionTitle: "Adoption & Operational Depth",
      tiles: [
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "teal",
          title: "Portfolio AI Adoption Score", value: "71/100", delta: "+9pts", deltaTone: "up",
          desc: "Composite index of AI deployment depth and breadth across PortCos, weighted by revenue.",
          rows: [
            { label: "PortCo Depth (Avg)", value: "71 pts", delta: "+9pts", deltaTone: "up" },
            { label: "Sector Benchmark (IoT)", value: "68 pts" },
            { label: "YoY Growth", value: "14.2%" },
          ],
        },
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "teal",
          title: "AI Projects: Prod vs PoC", value: "14 / 20", delta: "+4", deltaTone: "up",
          desc: "Ratio and count of AI initiatives currently in live production vs. experimental pilot stage.",
          rows: [
            { label: "In Production", value: "14", delta: "+4", deltaTone: "up" },
            { label: "In PoC / Pilot", value: "6", delta: "-1", deltaTone: "down" },
            { label: "Stalled / Retired", value: "2", delta: "-2", deltaTone: "down" },
          ],
          footnote: "Production Projects / Total Tracked AI Initiatives",
        },
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "teal",
          title: "AI Maturity Score (Composite)", value: "Level 3.4", delta: "+0.6", deltaTone: "up",
          desc: "Assessment of organizational capability, data readiness, and model governance.",
          rows: [
            { label: "Strategic Alignment", value: "4.1/5" },
            { label: "Technical Maturity", value: "2.8/5" },
            { label: "Talent Readiness", value: "3.3/5" },
          ],
        },
      ],
    },
    {
      sectionTitle: "Governance & Risk",
      tiles: [
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "teal",
          title: "AI Governance Score", value: "74/100", delta: "+7pts", deltaTone: "up",
          desc: "Compliance index based on policy adherence, audit readiness, and model risk management.",
          rows: [
            { label: "Data Privacy Compliance", value: "76/100", delta: "+8pts", deltaTone: "up" },
            { label: "Model Bias Risk", value: "71/100", delta: "+6pts", deltaTone: "up" },
            { label: "Regulatory Readiness", value: "68/100", delta: "+4pts", deltaTone: "up" },
          ],
          footnote: "Weighted: 40% Privacy | 30% Ethics | 30% Compliance",
        },
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "teal",
          title: "AI Incident Management", value: "2", delta: "-4", deltaTone: "down",
          desc: "Count of active or unresolved AI-related incidents (e.g., drift, data leakage, hallucination).",
          rows: [
            { label: "Critical / High Risk", value: "0", delta: "-1", deltaTone: "down" },
            { label: "Medium Risk", value: "2", delta: "-3", deltaTone: "down" },
            { label: "Mean Time to Resolution", value: "14.2h" },
          ],
        },
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "teal",
          title: "Policy Compliance Rate", value: "98.2%", delta: "+1.4%", deltaTone: "up",
          desc: "Percentage of employees and vendors adhering to the Global AI Acceptable Use Policy.",
          rows: [
            { label: "PortCo Internal", value: "99.1%" },
            { label: "Third-Party Vendors", value: "96.4%" },
            { label: "Training Completion", value: "100%" },
          ],
        },
      ],
    },
    {
      sectionTitle: "Cross-Portfolio Benchmarking",
      tiles: [
        {
          category: "efficiency", tag: "TOP QUARTILE", tagTone: "bench", accent: "amber",
          title: "Top Quartile", value: "28%",
          desc: "Portfolios in the top global AI maturity quartile.",
          rows: [
            { label: "Fortive Sensing", value: "" },
            { label: "ASP Global", value: "" },
          ],
        },
        {
          category: "efficiency", tag: "BOTTOM QUARTILE", tagTone: "bench", accent: "slate",
          title: "Bottom Quartile", value: "12%",
          desc: "Requiring urgent intervention / AI readiness gap.",
          rows: [{ label: "Legacy Controls Inc", value: "" }],
        },
        {
          category: "efficiency", tag: "INDUSTRY COMPARISON", tagTone: "bench", accent: "teal",
          title: "Portfolio vs Industry", value: "3.9x ROI", delta: "+1.5x vs peers", deltaTone: "up",
          desc: "Industry Median: 2.4x ROI",
          rows: [
            { label: "Portfolio Avg", value: "3.9x ROI" },
            { label: "Industry Median", value: "2.4x ROI" },
          ],
        },
      ],
    },
  ],

  business: [
    {
      sectionTitle: "Strategic Highlights",
      tiles: [
        {
          category: "revenue", tag: "REVENUE", tagTone: "revenue", accent: "emerald",
          title: "Revenue Uplift (AI-Attributed)", value: "$22.7M", delta: "+28%", deltaTone: "up",
          desc: "Direct and indirect top-line expansion driven by AI product features and sales-assist tools.",
          rows: [
            { label: "Direct AI Products", value: "$14.1M", delta: "+30%", deltaTone: "up" },
            { label: "AI-Enhanced Services", value: "$6.4M", delta: "+22%", deltaTone: "up" },
            { label: "Pipeline Influence", value: "$18.9M", delta: "+45%", deltaTone: "up" },
          ],
          footnote: "VALUE REALIZED - TOTAL COST / REVENUE BASE",
        },
        {
          category: "ebitda", tag: "EBITDA", tagTone: "ebitda", accent: "blue",
          title: "EBITDA Margin Impact", value: "+10.4pp", delta: "+3.4pp", deltaTone: "up",
          desc: "Percentage point improvement in EBITDA margin attributable to AI-driven cost optimization.",
          rows: [
            { label: "Cost Automation", value: "+4.8pp", delta: "+1.6pp", deltaTone: "up" },
            { label: "Headcount Efficiency", value: "+3.2pp", delta: "+1.1pp", deltaTone: "up" },
            { label: "Process Optimization", value: "+2.4pp", delta: "+0.7pp", deltaTone: "up" },
          ],
          footnote: "SUM OF PORTCO EBITDA DELTAS (WEIGHTED)",
        },
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "blue",
          title: "Portfolio AI Adoption Score", value: "71/100", delta: "+9pts", deltaTone: "up",
          desc: "A weighted composite index measuring the depth of AI integration across core business functions.",
          rows: [
            { label: "Tech Sector Core", value: "88/100", delta: "+4pts", deltaTone: "up" },
            { label: "Industrial Services", value: "62/100", delta: "+12pts", deltaTone: "up" },
            { label: "Healthcare Assets", value: "74/100", delta: "+7pts", deltaTone: "up" },
          ],
          footnote: "ADOPTION DEPTH * BUSINESS CRITICALITY",
        },
        {
          category: "ebitda", tag: "EBITDA", tagTone: "ebitda", accent: "emerald",
          title: "Aggregate Cost Savings", value: "$11.2M", delta: "+15%", deltaTone: "up",
          desc: "Validated OpEx reduction resulting from AI implementation in back-office and customer support.",
          rows: [
            { label: "Support Automation", value: "$4.1M", delta: "+18%", deltaTone: "up" },
            { label: "Procurement Ops", value: "$3.8M", delta: "+12%", deltaTone: "up" },
            { label: "Cloud FinOps", value: "$3.3M", delta: "+22%", deltaTone: "up" },
          ],
        },
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "blue",
          title: "Human Productivity Gains", value: "+32%", delta: "+4%", deltaTone: "up",
          desc: "Average increase in output per FTE across AI-enabled departments (Sales, Engineering, Support).",
          rows: [
            { label: "Dev Velocity", value: "+44%", delta: "+6%", deltaTone: "up" },
            { label: "Support Ticket Resolution", value: "+28%", delta: "+2%", deltaTone: "up" },
            { label: "Content Gen Speed", value: "+36%", delta: "+5%", deltaTone: "up" },
          ],
        },
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "rose",
          title: "AI Policy Compliance", value: "94%", delta: "+2%", deltaTone: "up",
          desc: "Percentage of AI use cases meeting internal ethical, legal, and data privacy guardrails.",
          rows: [
            { label: "Data Sovereignty", value: "98%", delta: "Stable" },
            { label: "Model Transparency", value: "89%", delta: "+4%", deltaTone: "up" },
            { label: "Third-party Risk", value: "92%", delta: "-1%", deltaTone: "down" },
          ],
          footnote: "COMPLIANT CASES / ACTIVE DEPLOYMENTS",
        },
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "blue",
          title: "DAU / MAU Intensity", value: "2.8k", delta: "+14%", deltaTone: "up",
          desc: "Total number of employees actively interacting with AI production tools on a daily basis.",
          rows: [
            { label: "Copilot Adoption", value: "1.2k", delta: "+8%", deltaTone: "up" },
            { label: "Custom Chat Agents", value: "900", delta: "+24%", deltaTone: "up" },
            { label: "Embedded Analytics", value: "700", delta: "+12%", deltaTone: "up" },
          ],
        },
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "blue",
          title: "Production Velocity", value: "53/68", delta: "+12", deltaTone: "up",
          desc: "Tracking the conversion of AI Proof-of-Concepts into live, value-generating production environments.",
          rows: [
            { label: "Prod (Active)", value: "53", delta: "+14", deltaTone: "up" },
            { label: "PoC / Pilot", value: "12", delta: "-4", deltaTone: "down" },
            { label: "Stalled / Deprioritized", value: "3", delta: "-2", deltaTone: "down" },
          ],
          footnote: "CURRENT QUARTER VS. PREVIOUS QUARTER",
        },
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "rose",
          title: "Human Review Coverage", value: "82%", delta: "+5%", deltaTone: "up",
          desc: "Audit coverage for high-criticality AI decisions requiring mandatory human-in-the-loop validation.",
          rows: [
            { label: "Financial Approval AI", value: "100%", delta: "Max" },
            { label: "Legal Document QA", value: "88%", delta: "+12%", deltaTone: "up" },
            { label: "Customer Response AI", value: "58%", delta: "-3%", deltaTone: "down" },
          ],
        },
        {
          category: "efficiency", tag: "BENCHMARKING", tagTone: "bench", accent: "slate",
          title: "Industry Benchmark", value: "+1.2x", delta: "+Top 15%", deltaTone: "up",
          desc: "Performance of Fortive Group portfolio against the global PE AI maturity index (sector-weighted).",
          rows: [
            { label: "SaaS Median", value: "1.1x", delta: "Above" },
            { label: "Mfg. Median", value: "1.4x", delta: "Lead" },
            { label: "FinServ Median", value: "0.9x", delta: "At Par" },
          ],
          footnote: "PORTFOLIO ROI / INDUSTRY MEDIAN ROI",
        },
        {
          category: "efficiency", tag: "BENCHMARKING", tagTone: "bench", accent: "slate",
          title: "Top Performer Ranking", value: "#1 Fluke",
          desc: "Top 3 companies by AI valuation multiplier impact and operational adoption score.",
          rows: [
            { label: "Fluke Corp", value: "92pts", delta: "Leader" },
            { label: "Tektronix", value: "86pts", delta: "+4pts", deltaTone: "up" },
            { label: "Industrial Sci.", value: "84pts", delta: "+12pts", deltaTone: "up" },
          ],
        },
      ],
    },
  ],

  technology: [
    {
      sectionTitle: "AI Adoption & Maturity",
      tiles: [
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "emerald",
          title: "AI Projects Portfolio", value: "156 Total", delta: "+22", deltaTone: "up",
          desc: "Aggregate count of AI initiatives across all pipeline stages.",
          rows: [
            { label: "Ideation/Discovery", value: "48", delta: "+8", deltaTone: "up" },
            { label: "In Development", value: "62", delta: "+12", deltaTone: "up" },
            { label: "Stalled/Paused", value: "14", delta: "-4", deltaTone: "down" },
            { label: "Retired/Completed", value: "32", delta: "+6", deltaTone: "up" },
          ],
        },
        {
          category: "adoption", tag: "BENCHMARKING", tagTone: "bench", accent: "emerald",
          title: "AI Maturity Score", value: "3.4 / 5.0", delta: "+0.4", deltaTone: "up",
          desc: "Cross-portfolio assessment of AI engineering culture & capabilities.",
          rows: [
            { label: "Data Infrastructure", value: "3.8", delta: "+0.2", deltaTone: "up" },
            { label: "MLOps Rigor", value: "2.9", delta: "+0.6", deltaTone: "up" },
            { label: "Talent Density", value: "3.5", delta: "+0.1", deltaTone: "up" },
            { label: "AI Governance", value: "3.4", delta: "+0.7", deltaTone: "up" },
          ],
        },
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "emerald",
          title: "% AI in Production", value: "34.0%", delta: "+5.2pp", deltaTone: "up",
          desc: "Ratio of started projects that have successfully reached production.",
          rows: [
            { label: "Production Assets", value: "53", delta: "+12", deltaTone: "up" },
            { label: "Non-Prod Assets", value: "103", delta: "+10", deltaTone: "up" },
            { label: "Cycle Time (Days)", value: "112", delta: "-14", deltaTone: "down" },
          ],
          footnote: "Production / Total Projects",
        },
      ],
    },
    {
      sectionTitle: "FinOps & Infrastructure",
      tiles: [
        {
          category: "ebitda", tag: "FINOPS", tagTone: "finops", accent: "emerald",
          title: "Total AI Spend", value: "$12.8M", delta: "+8.4%", deltaTone: "up",
          desc: "Year-to-date cloud, licensing, and compute costs for AI.",
          rows: [
            { label: "GPU/Compute", value: "$6.4M", delta: "+12%", deltaTone: "up" },
            { label: "API Licensing", value: "$2.9M", delta: "+4%", deltaTone: "up" },
            { label: "Storage/Data", value: "$3.5M", delta: "+6%", deltaTone: "up" },
          ],
        },
        {
          category: "ebitda", tag: "FINOPS", tagTone: "finops", accent: "emerald",
          title: "Spend by Model Family", value: "GPT-4 Dominant", delta: "-12%", deltaTone: "down",
          desc: "Cost distribution across commercial and open-source models.",
          rows: [
            { label: "OpenAI Stack", value: "62%", delta: "-3%", deltaTone: "down" },
            { label: "Anthropic / Claude", value: "18%", delta: "+4%", deltaTone: "up" },
            { label: "Llama (Self-Hosted)", value: "14%", delta: "-12%", deltaTone: "down" },
            { label: "Others", value: "6%", delta: "-2%", deltaTone: "down" },
          ],
        },
        {
          category: "ebitda", tag: "FINOPS", tagTone: "finops", accent: "emerald",
          title: "Forecasted AI Spend", value: "$18.2M", delta: "-15%", deltaTone: "down",
          desc: "Projected end-of-year spend based on current token usage velocity.",
          rows: [
            { label: "Committed Spend", value: "$14.1M" },
            { label: "Elastic/Variable", value: "$4.1M" },
            { label: "Budget Variance", value: "-4.2%" },
          ],
        },
        {
          category: "ebitda", tag: "FINOPS", tagTone: "finops", accent: "emerald",
          title: "Cost per AI Outcome", value: "$0.42", delta: "-18%", deltaTone: "down",
          desc: "Normalized cost per meaningful business result (e.g., ticket resolved).",
          rows: [
            { label: "Service Ops", value: "$0.12", delta: "-22%", deltaTone: "down" },
            { label: "Sales Assist", value: "$0.84", delta: "-5%", deltaTone: "down" },
            { label: "Software Dev", value: "$0.31", delta: "-14%", deltaTone: "down" },
          ],
        },
      ],
    },
    {
      sectionTitle: "System Reliability & SLIs",
      tiles: [
        {
          category: "efficiency", tag: "RELIABILITY", tagTone: "reliability", accent: "emerald",
          title: "System Availability", value: "99.94%", delta: "+0.02pp", deltaTone: "up",
          desc: "Uptime for primary AI inference endpoints across portfolio.",
          rows: [
            { label: "API Success Rate", value: "99.98%", delta: "+0.01", deltaTone: "up" },
            { label: "Internal Gateway", value: "99.92%", delta: "-0.04", deltaTone: "down" },
            { label: "Fallback Rate", value: "0.14%", delta: "-0.02", deltaTone: "down" },
          ],
        },
        {
          category: "efficiency", tag: "RELIABILITY", tagTone: "reliability", accent: "emerald",
          title: "Latency (P95)", value: "1.42s", delta: "-240ms", deltaTone: "down",
          desc: "Response time for consumer-facing LLM interactions.",
          rows: [
            { label: "TTFT (P95)", value: "420ms", delta: "-80ms", deltaTone: "down" },
            { label: "Total Resp (P50)", value: "840ms", delta: "-110ms", deltaTone: "down" },
            { label: "Queue Time", value: "12ms", delta: "-2ms", deltaTone: "down" },
          ],
        },
        {
          category: "efficiency", tag: "RELIABILITY", tagTone: "reliability", accent: "emerald",
          title: "Error Rate", value: "0.08%", delta: "-0.04pp", deltaTone: "down",
          desc: "Uncaught exceptions or 5xx responses from AI systems.",
          rows: [
            { label: "Hallucination Det.", value: "2.4%", delta: "-0.8%", deltaTone: "down" },
            { label: "Connection Timeout", value: "0.02%", delta: "-0.01%", deltaTone: "down" },
            { label: "Token Limit Error", value: "0.04%", delta: "-0.03%", deltaTone: "down" },
          ],
        },
        {
          category: "efficiency", tag: "RELIABILITY", tagTone: "reliability", accent: "emerald",
          title: "MTTR (Incident Response)", value: "24 min", delta: "-12 min", deltaTone: "down",
          desc: "Mean time to recover from AI-specific service degradation.",
          rows: [
            { label: "Auto-Healing Res.", value: "72%", delta: "+15%", deltaTone: "up" },
            { label: "On-Call Response", value: "8 min", delta: "-2 min", deltaTone: "down" },
            { label: "Deployment Rollback", value: "4 min", delta: "-1 min", deltaTone: "down" },
          ],
        },
      ],
    },
    {
      sectionTitle: "Governance & Security",
      tiles: [
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "emerald",
          title: "Governance Score", value: "74/100", delta: "+8pts", deltaTone: "up",
          desc: "Composite risk metric evaluating compliance and safety protocols.",
          rows: [
            { label: "Audit Readiness", value: "82/100", delta: "+12", deltaTone: "up" },
            { label: "Privacy Compliance", value: "68/100", delta: "+4", deltaTone: "up" },
            { label: "Model Safety Logs", value: "72/100", delta: "+9", deltaTone: "up" },
          ],
        },
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "emerald",
          title: "AI Incidents (MTD)", value: "3 Major", delta: "+1", deltaTone: "up",
          desc: "Critical issues related to model bias, data leakage, or safety.",
          rows: [
            { label: "Data Spills", value: "0", delta: "-1", deltaTone: "down" },
            { label: "Prompt Injections", value: "14", delta: "+2", deltaTone: "up" },
            { label: "PII Exposures", value: "1", delta: "0" },
          ],
        },
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "emerald",
          title: "Policy Compliance", value: "94.2%", delta: "+2.1pp", deltaTone: "up",
          desc: "Percentage of AI projects meeting minimum PE-defined safety policies.",
          rows: [
            { label: "Human-in-Loop Cov.", value: "88%", delta: "+14%", deltaTone: "up" },
            { label: "Adversarial Testing", value: "76%", delta: "+22%", deltaTone: "up" },
            { label: "Ethics Review", value: "100%", delta: "0" },
          ],
        },
      ],
    },
  ],

  operations: [
    {
      sectionTitle: "Automation Coverage",
      tiles: [
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "violet",
          title: "Productivity Gains", value: "+24%", delta: "+6pp", deltaTone: "up",
          desc: "Aggregate operational throughput increase via AI agents.",
          rows: [
            { label: "Back-office Ops", value: "+31%", delta: "+8pp", deltaTone: "up" },
            { label: "Customer Support", value: "+18%", delta: "+4pp", deltaTone: "up" },
            { label: "Sales Automation", value: "+22%", delta: "+7pp", deltaTone: "up" },
          ],
          footnote: "THROUGHPUT / TOTAL MAN-HOURS",
        },
        {
          category: "ebitda", tag: "EBITDA", tagTone: "ebitda", accent: "violet",
          title: "Cost Savings (OpEx)", value: "$12.8M", delta: "-14%", deltaTone: "down",
          desc: "Realized reduction in operational expenses from AI deployment.",
          rows: [
            { label: "Labor Arbitrage", value: "$6.4M", delta: "-18%", deltaTone: "down" },
            { label: "System Consolidation", value: "$4.2M", delta: "-11%", deltaTone: "down" },
            { label: "Vendor Reduction", value: "$2.2M", delta: "-9%", deltaTone: "down" },
          ],
          footnote: "CURRENT SPEND VS. PRE-AI BASELINE",
        },
        {
          category: "efficiency", tag: "FINOPS", tagTone: "finops", accent: "violet",
          title: "Budget Adherence", value: "98.2%", delta: "+1.2%", deltaTone: "up",
          desc: "Closeness of actual AI operational spend to forecasted budget.",
          rows: [
            { label: "Cloud Compute", value: "104%", delta: "-4%", deltaTone: "down" },
            { label: "Token Consumption", value: "92%", delta: "+8%", deltaTone: "up" },
            { label: "Team Overhead", value: "99%", delta: "+1%", deltaTone: "up" },
          ],
          footnote: "ACTUAL OPEX / FORECASTED BUDGET",
        },
      ],
    },
    {
      sectionTitle: "User Adoption",
      tiles: [
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "violet",
          title: "Portfolio AI Adoption Score", value: "71/100", delta: "+9pts", deltaTone: "up",
          desc: "Composite index: AI deployment depth & breadth across PortCos.",
          rows: [
            { label: "By Enterprise", value: "76 pts", delta: "+11", deltaTone: "up" },
            { label: "By SMB Units", value: "62 pts", delta: "+4", deltaTone: "up" },
            { label: "SaaS Vertical", value: "81 pts", delta: "+14", deltaTone: "up" },
          ],
        },
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "violet",
          title: "Active AI Users", value: "2,772", delta: "+18%", deltaTone: "up",
          desc: "Total employees with at least 5 weekly AI tool interactions.",
          rows: [
            { label: "Power Users (>20/wk)", value: "844", delta: "+22%", deltaTone: "up" },
            { label: "Casual Users", value: "1,928", delta: "+14%", deltaTone: "up" },
            { label: "Inactive Seats", value: "312", delta: "-8%", deltaTone: "down" },
          ],
        },
        {
          category: "adoption", tag: "ADOPTION", tagTone: "adoption", accent: "violet",
          title: "% AI in Production", value: "64%", delta: "+11pp", deltaTone: "up",
          desc: "Ratio of approved AI use cases currently in a production state.",
          rows: [
            { label: "Live Agents", value: "18", delta: "+5", deltaTone: "up" },
            { label: "PoC / Pilot", value: "12", delta: "-3", deltaTone: "down" },
            { label: "Discovery Phase", value: "7", delta: "-2", deltaTone: "down" },
          ],
          footnote: "PROD PROJECTS / TOTAL TRACKED USE CASES",
        },
      ],
    },
    {
      sectionTitle: "Governance & Reliability",
      tiles: [
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "violet",
          title: "AI Incidents (Critical)", value: "02", delta: "-04", deltaTone: "down",
          desc: "Count of high-impact AI failures or policy violations.",
          rows: [
            { label: "Security Breaches", value: "0", delta: "0" },
            { label: "Model Hallucinations", value: "2", delta: "-3", deltaTone: "down" },
            { label: "Bias/Equity Issues", value: "0", delta: "-1", deltaTone: "down" },
          ],
        },
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "violet",
          title: "Availability (Uptime)", value: "99.98%", delta: "+0.04%", deltaTone: "up",
          desc: "System uptime across critical AI-driven infrastructure.",
          rows: [
            { label: "Core LLM Gateway", value: "99.99%", delta: "+0.01%", deltaTone: "up" },
            { label: "Custom Agents", value: "99.94%", delta: "+0.12%", deltaTone: "up" },
            { label: "Data Pipeline", value: "99.98%", delta: "0" },
          ],
        },
        {
          category: "risk", tag: "RISK", tagTone: "risk", accent: "violet",
          title: "Human Review Coverage", value: "88%", delta: "+14pp", deltaTone: "up",
          desc: "Percentage of AI outputs subjected to human-in-the-loop audit.",
          rows: [
            { label: "Fin. Approvals", value: "100%", delta: "0" },
            { label: "Customer Chat", value: "15%", delta: "+3pp", deltaTone: "up" },
            { label: "Report Gen", value: "92%", delta: "+8pp", deltaTone: "up" },
          ],
        },
      ],
    },
    {
      sectionTitle: "Benchmarking",
      tiles: [
        {
          category: "efficiency", tag: "BENCHMARKING", tagTone: "bench", accent: "emerald",
          title: "Portfolio Ranking", value: "Top 15%", delta: "+5%", deltaTone: "up",
          desc: "Nexus AI maturity relative to industry-matched PE benchmarks.",
          rows: [
            { label: "Adoption Velocity", value: "92nd Pctl", delta: "+2", deltaTone: "up" },
            { label: "Cost Efficiency", value: "88th Pctl", delta: "+4", deltaTone: "up" },
            { label: "Governance Level", value: "94th Pctl", delta: "+1", deltaTone: "up" },
          ],
        },
        {
          category: "efficiency", tag: "BENCHMARKING", tagTone: "bench", accent: "slate",
          title: "Industry Comparison", value: "3.9x vs 2.4x",
          desc: "Portfolio Avg ROI vs Industry Median ROI",
          rows: [
            { label: "Portfolio Avg ROI", value: "3.9x" },
            { label: "Industry Median", value: "2.4x" },
          ],
          footnote: "Benchmarks aggregated from 12 competing PE firms and 400+ PortCos.",
        },
        {
          category: "efficiency", tag: "FINOPS", tagTone: "finops", accent: "violet",
          title: "Forecasted Spend (Q4)", value: "$4.2M", delta: "+18%", deltaTone: "up",
          desc: "Projected cloud and token spend for current active initiatives.",
          rows: [
            { label: "Infra Expansion", value: "$2.1M", delta: "+30%", deltaTone: "up" },
            { label: "New Licenses", value: "$0.8M", delta: "+10%", deltaTone: "up" },
            { label: "Maintenance", value: "$1.3M", delta: "0" },
          ],
        },
      ],
    },
  ],
};

// Top-level KPI summary strip
const SUMMARY = [
  { label: "AI Revenue", value: "$92.4M", delta: "+12.4%", icon: Globe },
  { label: "EBITDA Uplift", value: "+10.4%", delta: "+3.2pp", icon: TrendingUp },
  { label: "AI ROI", value: "3.9x", delta: "+0.4x", icon: BarChart3 },
  { label: "Adoption Score", value: "73/100", delta: "+9pts", icon: Activity },
  { label: "Active AI Users", value: "2,772", delta: "+418", icon: Users },
  { label: "Prod Projects", value: "53", delta: "+12", icon: Zap },
];

function NexusDashboard() {
  const [persona, setPersona] = useState<Persona>("cxo");
  const [subTab, setSubTab] = useState<SubTab>("all");

  const sections = TILES[persona];
  const visibleSections = sections
    .map((s) => ({
      ...s,
      tiles: subTab === "all" ? s.tiles : s.tiles.filter((t) => t.category === subTab),
    }))
    .filter((s) => s.tiles.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white">
                <Activity className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold tracking-tight">Nexus Observatory</div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Context
              </span>
              <select className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="all">◈ All Portfolio (Fortive Group)</option>
                <option value="gordion">Gordion · Industrial IoT · Growth</option>
                <option value="provation">Provation · Healthcare IT · Series C</option>
                <option value="fluke">Fluke · Test &amp; Measurement · Mature</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Download Dashboard
            </button>
            <button className="flex items-center gap-2 rounded-md bg-teal-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-600">
              <Plus className="h-4 w-4" />
              Add KPI
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-500" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SUMMARY.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {k.label}
                  </div>
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</div>
                <div className="mt-1 text-[11px] font-medium text-emerald-600">{k.delta}</div>
              </div>
            );
          })}
        </div>

        {/* Persona tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Persona View
            </span>
            {PERSONAS.map((p) => {
              const active = persona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-teal-200 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", p.dot)} />
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
              <Plus className="h-4 w-4" />
              Add PortCo
            </button>
            <button className="flex items-center gap-2 rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50">
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200">
          <nav className="flex flex-wrap gap-1">
            {SUBTABS.map((t) => {
              const active = subTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSubTab(t.id)}
                  className={cn(
                    "border-b-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors",
                    active
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-slate-500 hover:text-slate-700",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
          <Link
            to="/workforce"
            search={{ persona } as never}
            className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-indigo-500 to-teal-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-600 hover:to-teal-600"
          >
            View Detail Insights ({PERSONAS.find((p) => p.id === persona)?.label})
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Sections */}
        <div className="mt-6 space-y-8">
          {visibleSections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
              No KPIs configured for this view yet.
            </div>
          ) : (
            visibleSections.map((section) => (
              <section key={section.sectionTitle}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {section.sectionTitle}
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {section.tiles.map((tile, i) => (
                    <TileCard key={`${tile.title}-${i}`} tile={tile} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <div>© 2026 Nexus Observatory · PE AI Observability Tower v4.2.0</div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            System Live: Real-time data sync active
          </div>
        </footer>
      </main>
    </div>
  );
}

function TileCard({ tile }: { tile: Tile }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className={cn("h-[3px] w-full", accentBar[tile.accent])} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              tagStyles[tile.tagTone],
            )}
          >
            {tile.tag}
          </span>
          {tile.delta && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                tile.deltaTone === "down" ? "text-rose-600" : "text-emerald-600",
              )}
            >
              {tile.deltaTone === "down" ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {tile.delta}
            </span>
          )}
        </div>

        <div className="mt-3 text-sm font-medium text-slate-700">{tile.title}</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          {tile.value}
        </div>

        {tile.desc && (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>{tile.desc}</span>
          </p>
        )}

        {tile.rows && tile.rows.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            {tile.rows.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{r.label}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{r.value}</span>
                  {r.delta && (
                    <span
                      className={cn(
                        "font-medium",
                        r.deltaTone === "down"
                          ? "text-rose-600"
                          : r.deltaTone === "up"
                            ? "text-emerald-600"
                            : "text-slate-400",
                      )}
                    >
                      {r.delta}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {tile.footnote && (
          <div className="mt-3 border-t border-dashed border-slate-200 pt-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
            {tile.footnote}
          </div>
        )}
      </div>
    </div>
  );
}
