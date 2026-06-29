import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Clock,
} from "lucide-react";
import { buildApiUrl } from "@/config/api";

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
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  message?: string;
};

function UploadPage() {
  const [companyId, setCompanyId] = useState("");
  const [period, setPeriod] = useState("");
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<{ companyId?: string; period?: string }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  function validateContext() {
    const next: { companyId?: string; period?: string } = {};
    if (!companyId.trim()) next.companyId = "Company ID is required";
    if (!period.trim()) next.period = "Persona is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function stageFiles(files: FileList | null) {
    if (!files) return;
    const incoming: UploadedDoc[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      file,
      status: "pending",
    }));
    setDocs((d) => [...d, ...incoming]);
  }

  async function uploadDoc(doc: UploadedDoc) {
    setDocs((d) => d.map((x) => (x.id === doc.id ? { ...x, status: "uploading" } : x)));
    const fd = new FormData();
    fd.append("file", doc.file);
    fd.append("company_id", companyId);
    fd.append("period", period);
    try {
      const res = await fetch(buildApiUrl("/documents/upload"), { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.detail || `Upload failed [${res.status}]`);
      setDocs((d) =>
        d.map((x) => (x.id === doc.id ? { ...x, status: "success", message: "Parsed & ingested" } : x))
      );
    } catch (err) {
      setDocs((d) =>
        d.map((x) => (x.id === doc.id ? { ...x, status: "error", message: (err as Error).message } : x))
      );
    }
  }

  async function handleUpload() {
    if (!validateContext()) return;
    const pending = docs.filter((d) => d.status === "pending");
    if (!pending.length) return;
    await Promise.all(pending.map(uploadDoc));
  }

  const pendingCount = docs.filter((d) => d.status === "pending").length;
  const uploading = docs.some((d) => d.status === "uploading");

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => uploading,
    withResolver: true,
  });

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Upload Documents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Drop PortCo board decks, financials, or AI program reports. They're parsed, normalised, and fed into the KPI pipeline.
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
                Company Name <span className="text-rose-500">*</span>
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
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  if (errors.period) setErrors((p) => ({ ...p, period: undefined }));
                }}
                aria-required="true"
                aria-invalid={!!errors.period}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.period ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.period && (
                <div className="text-[11px] text-rose-600 mt-1">{errors.period}</div>
              )}
            </div>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            stageFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 bg-white hover:border-teal-400 hover:bg-slate-50"
          }`}
        >
          <UploadIcon className="w-10 h-10 mx-auto mb-3 text-teal-500" />
          <div className="text-sm font-semibold text-slate-900">
            Drag and drop documents or click to upload
          </div>
          <div className="text-[12px] text-slate-500 mt-1">
            PDF, DOCX, XLSX, PPTX, CSV — parsed via LlamaCloud
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => stageFiles(e.target.files)}
            accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.md"
          />
        </div>

        {/* File list */}
        {docs.length > 0 && (
          <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-400">
                DOCUMENTS ({docs.length})
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
                  {d.status === "pending" && <Clock className="w-4 h-4 text-slate-400" />}
                  {d.status === "uploading" && <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />}
                  {d.status === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {d.status === "error" && <AlertCircle className="w-4 h-4 text-rose-500" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload button */}
        {pendingCount > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 rounded-md bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
              {uploading ? "Uploading…" : `Upload ${pendingCount} file${pendingCount === 1 ? "" : "s"}`}
            </button>
          </div>
        )}
      </div>

      {/* Navigation-block dialog */}
      {status === "blocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="text-sm font-semibold text-slate-900 mb-2">
              Upload in progress
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Switching screens while uploading documents may stop the process. Do you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Stay
              </button>
              <button
                onClick={proceed}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-rose-500 hover:bg-rose-600"
              >
                Leave anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
