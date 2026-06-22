/**
 * periods.ts
 *
 * Builds period strings in the exact format the backend's
 * POST /kpis/trend endpoint expects:
 *   month   -> "YYYY-MM"   e.g. "2026-06"
 *   quarter -> "YYYY-Qn"   e.g. "2026-Q2"
 *   year    -> "YYYY"      e.g. "2026"
 *
 * IMPORTANT: this is intentionally separate from WORKFORCE_DEFAULT_PERIOD
 * ("2025-2026") used by the legacy /kpis/{company_id}/{period} endpoint -
 * that string is a free-text label the backend stores verbatim and matches
 * exactly, NOT a period the trend endpoint can parse. Don't reuse it here.
 *
 * There's no "what date range has data" endpoint, so the default window
 * is a trailing window ending at the current real-world date (last 12
 * months / last 4 quarters / last 3 years). A quarter/year with no
 * underlying data simply renders as a gap in the chart - exactly how the
 * backend's insufficient_data already behaves, so no special-casing
 * needed on the frontend either.
 */

export type Grain = 'M' | 'Q' | 'A'
export type PeriodType = 'month' | 'quarter' | 'year'

export const GRAIN_TO_PERIOD_TYPE: Record<Grain, PeriodType> = {
  M: 'month',
  Q: 'quarter',
  A: 'year',
}

function quarterOf(monthIndex0: number): number {
  return Math.floor(monthIndex0 / 3) + 1
}

/** "2026-06" */
export function monthPeriod(year: number, monthIndex0: number): string {
  return `${year}-${String(monthIndex0 + 1).padStart(2, '0')}`
}

/** "2026-Q2" */
export function quarterPeriod(year: number, monthIndex0: number): string {
  return `${year}-Q${quarterOf(monthIndex0)}`
}

/** "2026" */
export function yearPeriod(year: number): string {
  return String(year)
}

/** Short display label for chart x-axis - "Jun", "Q2", or "2026". */
export function periodLabel(grain: Grain, year: number, monthIndex0: number): string {
  if (grain === 'M') {
    return new Date(year, monthIndex0, 1).toLocaleString('en-US', { month: 'short' })
  }
  if (grain === 'Q') return `Q${quarterOf(monthIndex0)} '${String(year).slice(2)}`
  return String(year)
}

export interface PeriodWindow {
  periodType: PeriodType
  startPeriod: string
  endPeriod: string
  /** One entry per period in the window, in order - period string + display label. */
  periods: { period: string; label: string }[]
}

/**
 * Trailing window ending at `now` (defaults to the real current date).
 *   grain='M' -> trailing `count` months   (default 12)
 *   grain='Q' -> trailing `count` quarters (default 4)
 *   grain='A' -> trailing `count` years    (default 3)
 */
export function buildTrailingWindow(grain: Grain, count?: number, now: Date = new Date()): PeriodWindow {
  const periodType = GRAIN_TO_PERIOD_TYPE[grain]

  if (grain === 'M') {
    const n = count ?? 12
    const periods: { period: string; label: string }[] = []
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      periods.push({ period: monthPeriod(d.getFullYear(), d.getMonth()), label: periodLabel('M', d.getFullYear(), d.getMonth()) })
    }
    return { periodType, startPeriod: periods[0].period, endPeriod: periods[periods.length - 1].period, periods }
  }

  if (grain === 'Q') {
    const n = count ?? 4
    const currentQuarterStartMonth = Math.floor(now.getMonth() / 3) * 3
    const periods: { period: string; label: string }[] = []
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), currentQuarterStartMonth - i * 3, 1)
      periods.push({ period: quarterPeriod(d.getFullYear(), d.getMonth()), label: periodLabel('Q', d.getFullYear(), d.getMonth()) })
    }
    return { periodType, startPeriod: periods[0].period, endPeriod: periods[periods.length - 1].period, periods }
  }

  // grain === 'A'
  const n = count ?? 3
  const periods: { period: string; label: string }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const year = now.getFullYear() - i
    periods.push({ period: yearPeriod(year), label: periodLabel('A', year, 0) })
  }
  return { periodType, startPeriod: periods[0].period, endPeriod: periods[periods.length - 1].period, periods }
}
