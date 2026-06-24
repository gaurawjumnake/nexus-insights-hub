import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronRight, Settings2 } from "lucide-react";
import {
  getApiBaseUrl,
  setApiBaseUrl,
  getDefaultApiBaseUrl,
} from "@/config/api";

export function BackendConfigPanel() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(() => getApiBaseUrl());
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    setValue(getApiBaseUrl());
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setApiBaseUrl(value || getDefaultApiBaseUrl());
    qc.invalidateQueries();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="border-t border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-semibold tracking-[0.12em] text-slate-400">
            BACKEND CONFIG
          </span>
        </div>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {open && (
        <form onSubmit={handleSave} className="px-3 pb-3">
          <label className="block text-[11px] font-medium text-slate-600 mb-1">
            API Base URL
          </label>
          <input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://..."
            className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
            spellCheck={false}
          />
          <button
            type="submit"
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-teal-600 text-white text-[12px] font-medium hover:bg-teal-700 transition-colors"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved
              </>
            ) : (
              "Save"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
