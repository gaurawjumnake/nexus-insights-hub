import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getKpiInsights } from "@/services/kpiService";
import { renderMarkdown } from "@/lib/renderMarkdown";

export interface InsightsRequest {
  companyId: string;
  companyLabel: string;
  period: string;
  kpiIds: string[];
  question: string;
}

/**
 * Right-side drawer that fires a scoped POST /kpis/insights call on demand.
 * Not a passive panel — it only calls the (LLM-latency-bound, ~15s) endpoint
 * when a caller hands it a request via `open`. Closing/clearing the request
 * cancels interest in the in-flight query's result (react-query still lets
 * it finish and cache it, so re-opening the same request is instant).
 */
export function InsightsDrawer({
  request,
  onClose,
}: {
  request: InsightsRequest | null;
  onClose: () => void;
}) {
  const query = useQuery({
    queryKey: request
      ? ["kpi-insights", request.companyId, request.period, request.kpiIds, request.question]
      : ["kpi-insights", "idle"],
    queryFn: () => getKpiInsights(request!.companyId, request!.period, request!.kpiIds, request!.question),
    enabled: !!request,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return (
    <Sheet open={!!request} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            {request?.companyLabel ?? "Insights"}
          </SheetTitle>
          <SheetDescription>{request?.question}</SheetDescription>
        </SheetHeader>

        <div className="mt-5 text-[13px] leading-relaxed text-slate-700">
          {query.isFetching && (
            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-[12px]">Generating analysis — this can take up to ~15s…</span>
            </div>
          )}
          {query.isError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{(query.error as Error)?.message ?? "Insights generation failed."}</span>
            </div>
          )}
          {query.data && <div>{renderMarkdown(query.data.report)}</div>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
