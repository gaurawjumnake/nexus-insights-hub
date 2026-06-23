import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { buildApiUrl } from "@/config/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registry/add-fact")({
  component: AddFactPage,
});

type FactForm = {
  fact_id: string;
  name: string;
  category: string;
  description: string;
  data_type: string;
  business_definition: string;
  unit: string;
  fact_type: string;
  aggregation_strategy: string;
  missing_value_strategy: string;
  document_sources: string[];
  source_priority: string[];
  possible_aliases: string[];
  extraction_patterns: string[];
  related_facts: string[];
  used_by_kpis: string[];
  example_values: string[];
  min_confidence: number;
  auto_approve_above: number;
  manual_review_below: number;
  status: string;
  overwrite: boolean;
};

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
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
    <div className="flex flex-wrap gap-1.5 rounded-md border border-slate-200 px-2 py-1.5 min-h-[40px] focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
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

function AddFactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FactForm>({
    fact_id: "", name: "", category: "", description: "", data_type: "string",
    business_definition: "", unit: "", fact_type: "raw",
    aggregation_strategy: "latest_value", missing_value_strategy: "mark_unavailable",
    document_sources: [], source_priority: [], possible_aliases: [], extraction_patterns: [],
    related_facts: [], used_by_kpis: [], example_values: [],
    min_confidence: 0.8, auto_approve_above: 0.95, manual_review_below: 0.8,
    status: "active", overwrite: false,
  });
  const [banner, setBanner] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof FactForm>(k: K, v: FactForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch(buildApiUrl("/kpis/registry/facts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 409) {
        setBanner({ ok: false, msg: "Fact already exists. Enable 'Overwrite' to replace it." });
      } else if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const detail = Array.isArray(d.detail) ? d.detail.map((e: { msg: string }) => e.msg).join(", ") : (d.detail ?? `Error ${res.status}`);
        setBanner({ ok: false, msg: detail });
      } else {
        setBanner({ ok: true, msg: `Fact '${form.fact_id}' added. YAML written to registry/facts/${form.fact_id}.yaml` });
      }
    } catch (err: unknown) {
      setBanner({ ok: false, msg: err instanceof Error ? err.message : "Network error" });
    } finally {
      setBusy(false);
    }
  };

  const tagFields: { key: keyof FactForm; label: string; placeholder: string }[] = [
    { key: "document_sources", label: "Document Sources", placeholder: "e.g. telemetry, hr" },
    { key: "source_priority", label: "Source Priority", placeholder: "Ordered list" },
    { key: "possible_aliases", label: "Possible Aliases", placeholder: "e.g. employee id, staff id" },
    { key: "extraction_patterns", label: "Extraction Patterns", placeholder: "Regex or keyword patterns" },
  ];

  const relFields: { key: keyof FactForm; label: string; placeholder: string }[] = [
    { key: "related_facts", label: "Related Facts", placeholder: "Existing fact IDs" },
    { key: "used_by_kpis", label: "Used By KPIs", placeholder: "Existing KPI IDs" },
    { key: "example_values", label: "Example Values", placeholder: "e.g. EMP-10234" },
  ];

  const confFields: { key: keyof FactForm; label: string }[] = [
    { key: "min_confidence", label: "Minimum Confidence" },
    { key: "auto_approve_above", label: "Auto Approve Above" },
    { key: "manual_review_below", label: "Manual Review Below" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="text-xl font-semibold text-slate-900">Add Fact</h1>
        <p className="mt-1 text-sm text-slate-500 mb-6">Register a new fact in the KPI registry.</p>

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
              <label className={lbl}>Fact ID<Req /></label>
              <input className={inp} value={form.fact_id} onChange={(e) => set("fact_id", e.target.value)} onBlur={(e) => set("fact_id", slugify(e.target.value))} placeholder="employee_id" required />
            </div>
            <div>
              <label className={lbl}>Name<Req /></label>
              <input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Employee ID" required />
            </div>
            <div>
              <label className={lbl}>Category<Req /></label>
              <input className={inp} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="hr, telemetry, financial" required />
            </div>
            <div>
              <label className={lbl}>Description<Req /></label>
              <textarea className={cn(inp, "h-20 resize-none")} value={form.description} onChange={(e) => set("description", e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>Data Type<Req /></label>
              <select className={inp} value={form.data_type} onChange={(e) => set("data_type", e.target.value)}>
                {["string", "number", "currency", "percentage", "boolean", "date"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Definition */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Definition <span className="text-slate-400 normal-case font-normal text-xs">(optional)</span></h2>
            <div>
              <label className={lbl}>Business Definition</label>
              <textarea className={cn(inp, "h-20 resize-none")} value={form.business_definition} onChange={(e) => set("business_definition", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Unit</label>
              <input className={inp} value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="USD, ms, count" />
            </div>
            <div>
              <label className={lbl}>Fact Type</label>
              <select className={inp} value={form.fact_type} onChange={(e) => set("fact_type", e.target.value)}>
                {["raw", "derived", "composite"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Aggregation Strategy</label>
              <select className={inp} value={form.aggregation_strategy} onChange={(e) => set("aggregation_strategy", e.target.value)}>
                {["latest_value", "sum", "average", "count"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Missing Value Strategy</label>
              <select className={inp} value={form.missing_value_strategy} onChange={(e) => set("missing_value_strategy", e.target.value)}>
                {["mark_unavailable", "use_last_known", "interpolate"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Sources & Aliases */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sources & Aliases <span className="text-slate-400 normal-case font-normal text-xs">(optional)</span></h2>
            {tagFields.map(({ key, label, placeholder }) => (
              <div key={key as string}>
                <label className={lbl}>{label}</label>
                <TagInput value={form[key] as string[]} onChange={(v) => set(key, v as FactForm[typeof key])} placeholder={placeholder} />
              </div>
            ))}
          </div>

          {/* Relationships */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Relationships <span className="text-slate-400 normal-case font-normal text-xs">(optional)</span></h2>
            {relFields.map(({ key, label, placeholder }) => (
              <div key={key as string}>
                <label className={lbl}>{label}</label>
                <TagInput value={form[key] as string[]} onChange={(v) => set(key, v as FactForm[typeof key])} placeholder={placeholder} />
              </div>
            ))}
          </div>

          {/* Confidence Rules */}
          <Collapsible title="Confidence Rules (optional)">
            {confFields.map(({ key, label }) => (
              <div key={key as string}>
                <label className={lbl}>{label}</label>
                <input type="number" min="0" max="1" step="0.01" className={inp} value={form[key] as number} onChange={(e) => set(key, parseFloat(e.target.value))} />
              </div>
            ))}
          </Collapsible>

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
              {busy ? "Submitting…" : "Add Fact →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
