import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, X, AlertTriangle } from "lucide-react";
import { buildApiUrl } from "@/config/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registry/add-kpi")({
  component: AddKpiPage,
});

type KpiForm = {
  kpi_id: string;
  name: string;
  category: string;
  tier: string;
  description: string;
  business_value: string;
  formula: string;
  unit: string;
  aggregation: string;
  frequency: string;
  missing_data_strategy: string;
  example_calculation: string;
  required_facts: string[];
  derived_facts: string[];
  required_documents: string[];
  dependencies: string[];
  threshold_excellent: string;
  threshold_good: string;
  threshold_warning: string;
  threshold_critical: string;
  benchmarking_enabled: boolean;
  benchmark_type: string;
  benchmark_source: string;
  min_coverage: number;
  confidence_threshold: number;
  owner_persona: string[];
  dashboard_visibility: string[];
  status: string;
  overwrite: boolean;
};

function TagInput({
  value,
  onChange,
  placeholder,
  warn,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  warn?: boolean;
}) {
  const [input, setInput] = useState("");
  const commit = () => {
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
    setInput("");
  };
  return (
    <div className={cn("flex flex-wrap gap-1.5 rounded-md border px-2 py-1.5 min-h-[40px] focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500", warn ? "border-amber-300 bg-amber-50" : "border-slate-200")}>
      {value.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="text-slate-400 hover:text-slate-700">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); } }}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="flex-1 min-w-[100px] text-sm outline-none bg-transparent py-0.5"
      />
    </div>
  );
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-50">
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform text-slate-400", open && "rotate-180")} />
      </button>
      {open && <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">{children}</div>}
    </div>
  );
}

const lbl = "block text-xs font-medium text-slate-600 mb-1";
const inp = "w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white";
const Req = () => <span className="text-rose-500 ml-0.5">*</span>;

const slugify = (v: string) => v.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

function AddKpiPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<KpiForm>({
    kpi_id: "", name: "", category: "", tier: "operational", description: "",
    business_value: "", formula: "",
    unit: "", aggregation: "sum", frequency: "monthly", missing_data_strategy: "use_last_known",
    example_calculation: "",
    required_facts: [], derived_facts: [], required_documents: [], dependencies: [],
    threshold_excellent: "", threshold_good: "", threshold_warning: "", threshold_critical: "",
    benchmarking_enabled: false, benchmark_type: "", benchmark_source: "",
    min_coverage: 80, confidence_threshold: 0.8,
    owner_persona: [], dashboard_visibility: [],
    status: "active", overwrite: false,
  });
  const [banner, setBanner] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [unknownFacts, setUnknownFacts] = useState<string[]>([]);

  const set = <K extends keyof KpiForm>(k: K, v: KpiForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setBanner(null);
    setUnknownFacts([]);
    try {
      const res = await fetch(buildApiUrl("/kpis/registry/kpis"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 409) {
        setBanner({ ok: false, msg: "KPI already exists. Enable 'Overwrite' to replace it." });
      } else if (res.status === 422) {
        const d = await res.json().catch(() => ({}));
        if (Array.isArray(d.detail)) {
          const unknownMsg = d.detail.find((e: { msg: string }) => e.msg?.includes("unknown facts"));
          if (unknownMsg) {
            const match = unknownMsg.msg.match(/\[([^\]]+)\]/);
            if (match) setUnknownFacts(match[1].split(",").map((s: string) => s.trim()));
            setBanner({ ok: false, msg: `KPI references unknown facts: ${match?.[1] ?? ""}. Add those facts first.` });
          } else {
            setBanner({ ok: false, msg: d.detail.map((e: { msg: string }) => e.msg).join(", ") });
          }
        } else {
          setBanner({ ok: false, msg: d.detail ?? `Error ${res.status}` });
        }
      } else if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setBanner({ ok: false, msg: d.detail ?? `Error ${res.status}` });
      } else {
        setBanner({ ok: true, msg: `KPI '${form.kpi_id}' added. YAML written to registry/kpis/${form.kpi_id}.yaml` });
      }
    } catch (err: unknown) {
      setBanner({ ok: false, msg: err instanceof Error ? err.message : "Network error" });
    } finally {
      setBusy(false);
    }
  };

  const depFields: { key: keyof KpiForm; label: string; placeholder: string }[] = [
    { key: "derived_facts", label: "Derived Facts", placeholder: "Fact IDs" },
    { key: "required_documents", label: "Required Documents", placeholder: "e.g. telemetry, financial" },
    { key: "dependencies", label: "Dependencies", placeholder: "Other KPI IDs" },
  ];

  const ownerFields: { key: keyof KpiForm; label: string; placeholder: string }[] = [
    { key: "owner_persona", label: "Owner Persona", placeholder: "e.g. operating_partner, technology_lead" },
    { key: "dashboard_visibility", label: "Dashboard Visibility", placeholder: "e.g. adoption_dashboard" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="text-xl font-semibold text-slate-900">Add KPI</h1>
        <p className="mt-1 text-sm text-slate-500 mb-6">Register a new KPI in the registry.</p>

        {banner && (
          <div className={cn("mb-6 rounded-md border px-4 py-3 text-sm", banner.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800")}>
            {banner.msg}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {/* Identity */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Identity</h2>
            <div>
              <label className={lbl}>KPI ID<Req /></label>
              <input className={inp} value={form.kpi_id} onChange={(e) => set("kpi_id", e.target.value)} onBlur={(e) => set("kpi_id", slugify(e.target.value))} placeholder="active_ai_users" required />
            </div>
            <div>
              <label className={lbl}>Name<Req /></label>
              <input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Active AI Users" required />
            </div>
            <div>
              <label className={lbl}>Category<Req /></label>
              <input className={inp} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="User Adoption, Governance, Financial" required />
            </div>
            <div>
              <label className={lbl}>Tier<Req /></label>
              <select className={inp} value={form.tier} onChange={(e) => set("tier", e.target.value)}>
                {["operational", "strategic", "portfolio"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Description<Req /></label>
              <textarea className={cn(inp, "h-20 resize-none")} value={form.description} onChange={(e) => set("description", e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>Business Value</label>
              <textarea className={cn(inp, "h-20 resize-none")} value={form.business_value} onChange={(e) => set("business_value", e.target.value)} placeholder="Why this KPI matters" />
            </div>
            <div>
              <label className={lbl}>Formula</label>
              <textarea className={cn(inp, "h-20 resize-none font-mono text-xs")} value={form.formula} onChange={(e) => set("formula", e.target.value)} placeholder="count(employees WHERE weekly_ai_interactions >= 5)" />
            </div>
          </div>

          {/* Measurement */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Measurement <span className="text-slate-400 normal-case font-normal text-xs">(optional)</span></h2>
            <div>
              <label className={lbl}>Unit</label>
              <input className={inp} value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="count, USD, %, ms" />
            </div>
            <div>
              <label className={lbl}>Aggregation</label>
              <select className={inp} value={form.aggregation} onChange={(e) => set("aggregation", e.target.value)}>
                {["sum", "average", "count", "max", "min"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Frequency</label>
              <select className={inp} value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
                {["daily", "weekly", "monthly", "quarterly", "yearly"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Missing Data Strategy</label>
              <select className={inp} value={form.missing_data_strategy} onChange={(e) => set("missing_data_strategy", e.target.value)}>
                {["use_last_known", "mark_unavailable", "interpolate"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Example Calculation</label>
              <textarea className={cn(inp, "h-16 resize-none")} value={form.example_calculation} onChange={(e) => set("example_calculation", e.target.value)} placeholder="Optional narrative" />
            </div>
          </div>

          {/* Dependencies */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dependencies <span className="text-slate-400 normal-case font-normal text-xs">(optional)</span></h2>
            <div>
              <label className={lbl}>
                Required Facts
                {unknownFacts.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                    <AlertTriangle className="h-3 w-3" /> Unknown: {unknownFacts.join(", ")}
                  </span>
                )}
              </label>
              <TagInput value={form.required_facts} onChange={(v) => set("required_facts", v)} placeholder="Must exist in registry" warn={unknownFacts.length > 0} />
            </div>
            {depFields.map(({ key, label, placeholder }) => (
              <div key={key as string}>
                <label className={lbl}>{label}</label>
                <TagInput value={form[key] as string[]} onChange={(v) => set(key, v as KpiForm[typeof key])} placeholder={placeholder} />
              </div>
            ))}
          </div>

          {/* Thresholds */}
          <Collapsible title="Thresholds (optional)">
            {(["threshold_excellent", "threshold_good", "threshold_warning", "threshold_critical"] as const).map((k) => (
              <div key={k}>
                <label className={lbl}>{k.replace("threshold_", "").replace(/^\w/, (c) => c.toUpperCase())}</label>
                <input type="number" className={inp} value={form[k]} onChange={(e) => set(k, e.target.value)} />
              </div>
            ))}
          </Collapsible>

          {/* Benchmarking */}
          <Collapsible title="Benchmarking (optional)">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className={cn("relative w-10 h-5 rounded-full transition-colors", form.benchmarking_enabled ? "bg-teal-500" : "bg-slate-200")} onClick={() => set("benchmarking_enabled", !form.benchmarking_enabled)}>
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", form.benchmarking_enabled ? "left-5" : "left-0.5")} />
              </div>
              <span className="text-sm text-slate-600">Enabled</span>
            </label>
            <div>
              <label className={lbl}>Benchmark Type</label>
              <input className={inp} value={form.benchmark_type} onChange={(e) => set("benchmark_type", e.target.value)} placeholder="portfolio, industry" />
            </div>
            <div>
              <label className={lbl}>Benchmark Source</label>
              <input className={inp} value={form.benchmark_source} onChange={(e) => set("benchmark_source", e.target.value)} placeholder="internal, external" />
            </div>
          </Collapsible>

          {/* Data Quality */}
          <Collapsible title="Data Quality (optional)">
            <div>
              <label className={lbl}>Minimum Coverage (%)</label>
              <input type="number" min="0" max="100" className={inp} value={form.min_coverage} onChange={(e) => set("min_coverage", parseFloat(e.target.value))} />
            </div>
            <div>
              <label className={lbl}>Confidence Threshold (0–1)</label>
              <input type="number" min="0" max="1" step="0.01" className={inp} value={form.confidence_threshold} onChange={(e) => set("confidence_threshold", parseFloat(e.target.value))} />
            </div>
          </Collapsible>

          {/* Ownership & Visibility */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ownership & Visibility <span className="text-slate-400 normal-case font-normal text-xs">(optional)</span></h2>
            {ownerFields.map(({ key, label, placeholder }) => (
              <div key={key as string}>
                <label className={lbl}>{label}</label>
                <TagInput value={form[key] as string[]} onChange={(v) => set(key, v as KpiForm[typeof key])} placeholder={placeholder} />
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Settings</h2>
            <div>
              <label className={lbl}>Status</label>
              <select className={inp} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {["active", "inactive", "deprecated"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className={cn("relative w-10 h-5 rounded-full transition-colors", form.overwrite ? "bg-teal-500" : "bg-slate-200")} onClick={() => set("overwrite", !form.overwrite)}>
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", form.overwrite ? "left-5" : "left-0.5")} />
              </div>
              <span className="text-sm text-slate-600">Overwrite if exists</span>
            </label>
          </div>

          <div className="flex gap-3 pb-10">
            <button type="button" onClick={() => navigate({ to: "/" })} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-60">
              {busy ? "Submitting…" : "Add KPI →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
