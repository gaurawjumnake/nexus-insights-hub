import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { kpiKeys } from "@/hooks/useKpis";
import { buildApiUrl, getApiBaseUrl } from "@/config/api";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Documents — Nexus" },
      { name: "description", content: "Upload portfolio documents to feed the KPI pipeline." },
    ],
  }),
  component: UploadPage,
});

type UploadedDoc = {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "success" | "error";
  message?: string;
  response?: unknown;
};

function UploadPage() {
  const [companyId, setCompanyId] = useState("");
  const [persona, setPersona] = useState("");
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [dragging, setDragging] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calcMessage, setCalcMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ companyId?: string; persona?: string }>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  function validateContext() {
    const next: { companyId?: string; persona?: string } = {};
    if (!companyId.trim()) next.companyId = "Company ID is required";
    if (!persona.trim()) next.persona = "Persona is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function uploadFile(file: File) {
    const id = crypto.randomUUID();
    setDocs((d) => [
      ...d,
      { id, name: file.name, size: file.size, status: "uploading" },
    ]);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("company_id", companyId);
    fd.append("period", persona);

    try {
      const res = await fetch(buildApiUrl("/documents/upload"), {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.detail || `Upload failed [${res.status}]`);
      setDocs((d) =>
        d.map((doc) =>
          doc.id === id
            ? { ...doc, status: "success", message: "Parsed & ingested", response: body }
            : doc,
        ),
      );
    } catch (err) {
      setDocs((d) =>
        d.map((doc) =>
          doc.id === id
            ? { ...doc, status: "error", message: (err as Error).message }
            : doc,
        ),
      );
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  }

  async function runCalculation() {
    setCalculating(true);
    setCalcMessage(null);
    try {
      const res = await fetch(buildApiUrl("/kpis/calculate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId, period: persona }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.detail || `Calculate failed [${res.status}]`);
      await queryClient.invalidateQueries({ queryKey: kpiKeys.all });
      setCalcMessage("KPIs recalculated. All dashboards refreshed.");
    } catch (err) {
      setCalcMessage((err as Error).message);
    } finally {
      setCalculating(false);
    }
  }

  const successCount = docs.filter((d) => d.status === "success").length;

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Upload Documents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Drop PortCo board decks, financials, or AI program reports. They're parsed,
            normalised, and fed into the KPI pipeline.
          </p>
        </div>

        {/* Context selector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 mb-3">
            INGESTION CONTEXT
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1">
                Company ID <span className="text-rose-500">*</span>
              </label>
              <input
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value);
                  if (errors.companyId) setErrors((p) => ({ ...p, companyId: undefined }));
                }}
                aria-required="true"
                aria-invalid={!!errors.companyId}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.companyId ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.companyId && (
                <div className="text-[11px] text-rose-600 mt-1">{errors.companyId}</div>
              )}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1">
                Persona <span className="text-rose-500">*</span>
              </label>
              <input
                value={persona}
                onChange={(e) => {
                  setPersona(e.target.value);
                  if (errors.persona) setErrors((p) => ({ ...p, persona: undefined }));
                }}
                aria-required="true"
                aria-invalid={!!errors.persona}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.persona ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.persona && (
                <div className="text-[11px] text-rose-600 mt-1">{errors.persona}</div>
              )}
            </div>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (validateContext()) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!validateContext()) return;
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => {
            if (validateContext()) inputRef.current?.click();
          }}
          className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 bg-white hover:border-teal-400 hover:bg-slate-50"
          }`}
        >
          <UploadIcon className="w-10 h-10 mx-auto mb-3 text-teal-500" />
          <div className="text-sm font-semibold text-slate-900">
            Drop files here or click to browse
          </div>
          <div className="text-[12px] text-slate-500 mt-1">
            PDF, DOCX, XLSX, PPTX, CSV — parsed via LlamaCloud
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.md"
          />
        </div>

        {/* Upload button */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (validateContext()) inputRef.current?.click();
            }}
            className="px-4 py-2 rounded-md bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 flex items-center gap-2"
          >
            <UploadIcon className="w-4 h-4" />
            Upload
          </button>
        </div>


        {/* File list */}
        {docs.length > 0 && (
          <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-400">
                UPLOADS ({docs.length})
              </div>
              <button
                onClick={() => setDocs([])}
                className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {docs.map((d) => (
                <div key={d.id} className="px-5 py-3 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-900 truncate">{d.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {(d.size / 1024).toFixed(1)} KB
                      {d.message && ` · ${d.message}`}
                    </div>
                  </div>
                  {d.status === "uploading" && (
                    <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                  )}
                  {d.status === "success" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  {d.status === "error" && (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculate */}
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Recalculate KPIs
            </div>
            <div className="text-[12px] text-slate-500 mt-0.5">
              Trigger the pipeline for <span className="font-mono">{companyId}</span> ·{" "}
              <span className="font-mono">{period}</span>. {successCount} document
              {successCount === 1 ? "" : "s"} ready.
            </div>
            {calcMessage && (
              <div className="text-[12px] text-teal-700 mt-1.5">{calcMessage}</div>
            )}
          </div>
          <button
            onClick={runCalculation}
            disabled={calculating}
            className="px-4 py-2 rounded-md bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {calculating && <Loader2 className="w-4 h-4 animate-spin" />}
            {calculating ? "Running…" : "Run Pipeline"}
          </button>
        </div>

        <div className="mt-6 text-[11px] text-slate-400">
          API: <span className="font-mono">{getApiBaseUrl()}</span>
        </div>
      </div>
    </div>
  );
}
