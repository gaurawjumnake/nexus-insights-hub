/**
 * kpiService.ts
 * Thin HTTP layer for the KPI pipeline.
 * All endpoints are configurable via VITE_API_BASE_URL.
 *
 * IMPORTANT: this backend has no /companies endpoint (confirmed via its
 * Swagger schema — only /kpis/, /kpis/{company_id}/{period}, /kpis/extract,
 * /kpis/calculate, /kpis/trend, /kpis/insights, /documents/*, /health exist).
 * The only reliable way to discover which companies/periods exist is to
 * call GET /kpis/ (returns { kpis: RawKpi[] } for every company) and group
 * by company_id ourselves. We do that instead of guessing company names.
 */
import type { RawKpi } from '@/lib/normaliseKpi'
import { buildApiUrl } from '@/config/api'

export const DEFAULT_PERIOD = '2025-2026'

export interface Company {
  id: string
  label: string
  sector?: string
}

function pretty(id: string) {
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Unwrap the various shapes a KPI endpoint on this backend can return. */
function extractKpiArray(data: unknown): RawKpi[] {
  if (Array.isArray(data)) return data as RawKpi[]
  const obj = data as Record<string, unknown> | null | undefined
  if (Array.isArray(obj?.kpis)) return obj.kpis as RawKpi[]
  if (Array.isArray(obj?.items)) return obj.items as RawKpi[]
  return []
}

/**
 * GET /kpis/ → { kpis: RawKpi[] } for every company/period this backend
 * currently has data for. This is the single source of truth for both the
 * company list and (optionally) the KPI values themselves.
 */
export async function getAllKpis(): Promise<RawKpi[]> {
  const res = await fetch(buildApiUrl('/kpis/'))
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`KPI list fetch failed [${res.status}]: ${body}`)
  }
  const data = await res.json()
  return extractKpiArray(data)
}

/**
 * Derives the company list by calling GET /kpis/ and grouping by company_id.
 * There is no dedicated /companies endpoint on this backend.
 */
export async function getCompanies(): Promise<Company[]> {
  try {
    const all = await getAllKpis()
    const ids = Array.from(new Set(all.map((r) => r.company_id).filter(Boolean)))
    return ids.map((id) => ({ id, label: pretty(id) })).sort((a, b) => a.label.localeCompare(b.label))
  } catch {
    return []
  }
}

/**
 * Derives the most recent / most common period present in the data, so
 * callers don't have to hardcode "2025-2026" if the backend moves on.
 * Falls back to DEFAULT_PERIOD if nothing is found.
 */
export async function getLatestPeriod(): Promise<string> {
  try {
    const all = await getAllKpis()
    const periods = all.map((r) => r.period).filter(Boolean)
    if (!periods.length) return DEFAULT_PERIOD
    // Most frequent period wins (handles mixed-period datasets gracefully).
    const counts = new Map<string, number>()
    for (const p of periods) counts.set(p, (counts.get(p) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  } catch {
    return DEFAULT_PERIOD
  }
}

/** GET /kpis/{company_id}/{period} → RawKpi[] */
export async function getCompanyKPIs(
  companyId: string,
  period: string = DEFAULT_PERIOD,
): Promise<RawKpi[]> {
  const url = buildApiUrl(`/kpis/${encodeURIComponent(companyId)}/${encodeURIComponent(period)}`)
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`KPI fetch failed [${res.status}]: ${body}`)
  }
  const data = await res.json()
  return extractKpiArray(data)
}

/** Fetches all companies in parallel. */
export async function getKPIs(
  companies: string[],
  period: string = DEFAULT_PERIOD,
): Promise<Record<string, RawKpi[]>> {
  const entries = await Promise.all(
    companies.map(async (c) => {
      try {
        return [c, await getCompanyKPIs(c, period)] as const
      } catch {
        return [c, [] as RawKpi[]] as const
      }
    }),
  )
  return Object.fromEntries(entries)
}

// ─── Trend (MoM / QoQ / YoY) ──────────────────────────────────────────────

export interface TrendPeriodResult {
  kpi_id: string
  value: number | string | null
  coverage: number
  status: string
  period: string
  missing_facts?: string[]
}

export interface TrendResponse {
  company_id: string
  period_type: 'month' | 'quarter' | 'year'
  start_period: string
  end_period: string
  results: Record<string, TrendPeriodResult[]>
}

/**
 * POST /kpis/trend → { results: { [kpi_id]: TrendPeriodResult[] } }
 *
 * One formula evaluated once per period between startPeriod and
 * endPeriod (inclusive). A period with no underlying data on the
 * backend comes back with status "insufficient_data" and value null -
 * the frontend should render that as a gap, never as zero or a
 * carried-over neighbor value.
 */
export async function getKpiTrend(
  companyId: string,
  kpiIds: string[],
  periodType: 'month' | 'quarter' | 'year',
  startPeriod: string,
  endPeriod: string,
  saveResults = false,
): Promise<TrendResponse> {
  const res = await fetch(buildApiUrl('/kpis/trend'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_id: companyId,
      kpi_ids: kpiIds,
      period_type: periodType,
      start_period: startPeriod,
      end_period: endPeriod,
      save_results: saveResults,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`KPI trend fetch failed [${res.status}]: ${body}`)
  }
  return res.json()
}