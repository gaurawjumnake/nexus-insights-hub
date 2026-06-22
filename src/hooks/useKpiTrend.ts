/**
 * useKpiTrend.ts
 *
 * Drives the Monthly / Quarterly / Annual trend toggle: fetches
 * POST /kpis/trend for a trailing window of periods and shapes the
 * result for direct use as Recharts `data`.
 *
 * Usage (drop-in replacement for a static REV_TREND_MONTHLY-style array):
 *
 *   const [grain, setGrain] = useState<Grain>('Q')
 *   const { data, isLoading, error } = useKpiTrend(companyId, {
 *     direct: 'direct_ai_revenue',
 *     assisted: 'ai_assisted_revenue',
 *   }, grain)
 *
 *   <LineChart data={data}>
 *     <Line dataKey="direct" ... />
 *     <Line dataKey="assisted" ... />
 *   </LineChart>
 *
 * Each row is { p: <display label>, direct: number | null, assisted: number | null }.
 * A null entry means the backend reported insufficient_data for that
 * period - Recharts skips null points by default (no `connectNulls`
 * prop is set here), so a gap in the data renders as a visible gap in
 * the line, never as zero or an interpolated/carried-over value.
 *
 * NOTE: company_id must be a real backend company id, not "all" - the
 * trend endpoint is scoped to one company (there's no portfolio-wide
 * trend aggregation on the backend yet). Pass enabled=false (or just
 * don't call this hook) when the UI's company selector is on "all" and
 * show a "select a company" state instead of guessing an aggregate.
 */
import { useQuery } from '@tanstack/react-query'
import { getKpiTrend, type TrendPeriodResult } from '@/services/kpiService'
import { buildTrailingWindow, type Grain } from '@/lib/periods'

const STALE_TIME = 2 * 60 * 1000

export type TrendRow = { p: string } & Record<string, number | null>

export interface UseKpiTrendResult {
  /** Recharts-ready rows: [{ p: "Jan", direct: 0.5, assisted: 0.4 }, ...] */
  data: TrendRow[]
  isLoading: boolean
  isFetching: boolean
  error: Error | null
}

function toNumberOrNull(v: TrendPeriodResult['value']): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return null // insufficient_data, error strings, percentile strings, etc. -> gap, never 0
}

/**
 * @param companyId   real backend company id (not "all")
 * @param seriesKpis  maps a chart series key -> backend kpi_id, e.g.
 *                    { direct: 'direct_ai_revenue', assisted: 'ai_assisted_revenue' }
 * @param grain       'M' | 'Q' | 'A'
 * @param windowSize  how many trailing periods to show (defaults: 12 months / 4 quarters / 3 years)
 */
export function useKpiTrend(
  companyId: string,
  seriesKpis: Record<string, string>,
  grain: Grain,
  windowSize?: number,
): UseKpiTrendResult {
  const window = buildTrailingWindow(grain, windowSize)
  const kpiIds = Object.values(seriesKpis)
  const enabled = Boolean(companyId) && companyId !== 'all' && kpiIds.length > 0

  const query = useQuery({
    queryKey: ['kpi-trend', companyId, window.periodType, window.startPeriod, window.endPeriod, kpiIds.join(',')],
    queryFn: () => getKpiTrend(companyId, kpiIds, window.periodType, window.startPeriod, window.endPeriod),
    staleTime: STALE_TIME,
    enabled,
    throwOnError: false,
    placeholderData: (prev) => prev,
  })

  const data: TrendRow[] = window.periods.map(({ period, label }) => {
    const row: TrendRow = { p: label }
    for (const [seriesKey, kpiId] of Object.entries(seriesKpis)) {
      const periodResults = query.data?.results?.[kpiId] ?? []
      const match = periodResults.find((r) => r.period === period)
      row[seriesKey] = match ? toNumberOrNull(match.value) : null
    }
    return row
  })

  return {
    data,
    isLoading: enabled ? query.isLoading : false,
    isFetching: query.isFetching,
    error: query.error as Error | null,
  }
}
