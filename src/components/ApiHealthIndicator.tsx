import { useApiHealth, type ApiHealthStatus } from "@/hooks/useApiHealth";
import { cn } from "@/lib/utils";

const META: Record<
  ApiHealthStatus,
  { label: string; dot: string; text: string }
> = {
  connected: {
    label: "Connected",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  empty: {
    label: "No KPI Data",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  offline: {
    label: "Backend Offline",
    dot: "bg-rose-500",
    text: "text-rose-700",
  },
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ApiHealthIndicator({ collapsed }: { collapsed?: boolean }) {
  const { data, isLoading } = useApiHealth();
  const status: ApiHealthStatus = data?.status ?? "offline";
  const meta = META[status];

  if (collapsed) {
    return (
      <div
        className="flex items-center justify-center py-3 border-t border-slate-200"
        title={`API: ${isLoading ? "Checking…" : meta.label}`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping",
              meta.dot,
            )}
          />
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", meta.dot)} />
        </span>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-t border-slate-200">
      <div className="text-[10px] font-semibold tracking-[0.12em] text-slate-400 mb-1.5">
        API STATUS
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("inline-block h-2 w-2 rounded-full", meta.dot)} />
        <span className={cn("text-[12px] font-medium", meta.text)}>
          {isLoading ? "Checking…" : meta.label}
        </span>
      </div>
      <div className="mt-1 text-[10px] text-slate-400">
        {data?.checkedAt
          ? `Last checked: ${formatTime(data.checkedAt)}`
          : "Last checked: —"}
      </div>
    </div>
  );
}
