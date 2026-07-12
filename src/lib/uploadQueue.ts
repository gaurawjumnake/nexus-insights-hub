/**
 * uploadQueue.ts
 *
 * Module-level (not component-level) upload queue so document uploads
 * survive navigating away from /upload — an in-flight fetch() is tied to
 * the page's JS runtime, not to any one React component, so keeping the
 * queue here (instead of useState inside UploadPage) means the upload
 * finishes and reports success/failure via toast even if the user has
 * already switched screens. Mirrors the pub-sub pattern in ai-assistant-state.ts.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { buildApiUrl } from "@/config/api";

const EVT = "nexus:upload-queue";

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export type UploadedDoc = {
  id: string;
  name: string;
  size: number;
  file: File;
  status: UploadStatus;
  message?: string;
};

let _docs: UploadedDoc[] = [];

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

export function getDocs(): UploadedDoc[] {
  return _docs;
}

export function useUploadQueue(): UploadedDoc[] {
  const [docs, setDocs] = useState<UploadedDoc[]>(_docs);
  useEffect(() => {
    const h = () => setDocs([..._docs]);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return docs;
}

export function stageFiles(files: FileList | null) {
  if (!files) return;
  const incoming: UploadedDoc[] = Array.from(files).map((file) => ({
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    file,
    status: "pending",
  }));
  _docs = [..._docs, ...incoming];
  notify();
}

export function clearDocs() {
  _docs = [];
  notify();
}

function setDocStatus(id: string, status: UploadStatus, message?: string) {
  _docs = _docs.map((x) => (x.id === id ? { ...x, status, message } : x));
  notify();
}

async function uploadOne(doc: UploadedDoc, companyId: string, period: string): Promise<boolean> {
  setDocStatus(doc.id, "uploading");
  const fd = new FormData();
  fd.append("file", doc.file);
  fd.append("company_id", companyId);
  fd.append("period", period);
  try {
    const res = await fetch(buildApiUrl("/documents/upload"), { method: "POST", body: fd });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.detail || `Upload failed [${res.status}]`);
    setDocStatus(doc.id, "success", "Parsed & ingested");
    return true;
  } catch (err) {
    setDocStatus(doc.id, "error", (err as Error).message);
    return false;
  }
}

/**
 * Uploads every pending doc. Runs to completion regardless of whether the
 * caller (UploadPage) is still mounted — the toast at the end is how the
 * user finds out, even from a different screen.
 */
export async function runUpload(companyId: string, period: string): Promise<void> {
  const pending = _docs.filter((d) => d.status === "pending");
  if (!pending.length) return;

  const results = await Promise.all(pending.map((d) => uploadOne(d, companyId, period)));
  const successCount = results.filter(Boolean).length;
  const failCount = results.length - successCount;

  if (successCount > 0) {
    toast.success(`${successCount} document${successCount === 1 ? "" : "s"} uploaded successfully`);
  }
  if (failCount > 0) {
    toast.error(`${failCount} document${failCount === 1 ? "" : "s"} failed to upload`);
  }
}

export function isUploading(docs: UploadedDoc[]): boolean {
  return docs.some((d) => d.status === "uploading");
}
