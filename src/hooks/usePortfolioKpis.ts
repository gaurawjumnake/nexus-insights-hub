/**
 * usePortfolioKpis.ts
 *
 * Single source of truth for the executive dashboard + compare screen.
 * - Loads /companies (with fallback) via TanStack Query
 * - Loads /kpis/{company}/{period} for every company in parallel
 * - Exposes per-company maps + portfolio aggregate
 */
/**
 * usePortfolioKpis.ts
 *
 * Single source of truth for the executive dashboard + compare screen.
 * - Loads every KPI via GET /kpis/ (the only endpoint this backend exposes
 *   for bulk reads) and derives the company list + period from that data —
 *   there is no /companies endpoint, so we stop guessing company names.
 * - Exposes per-company maps + portfolio aggregate.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllKpis, getCompanyKPIs, DEFAULT_PERIOD, type Company } from '@/services/kpiService'
import { normaliseKpiList, type NormalisedKpi, type RawKpi } from '@/lib/normaliseKpi'
import { aggregatePortfolio } from '@/utils/kpiAggregation'
import { useMemo } from 'react'

const STALE_TIME = 2 * 60 * 1000

export const kpiKeys = {
  all: ['kpis-all'] as const,
  kpis: (companyId: string, period: string) =>
    ['kpis', companyId, period] as const,
}

export interface UsePortfolioKpisResult {
  companies: Company[]
  isLoadingCompanies: boolean
  isLoadingKpis: boolean
  isFetching: boolean
  error: Error | null
  /** Per-company normalised KPI maps. */
  perCompany: Record<string, Record<string, NormalisedKpi>>
  /** Portfolio rollup (SUM / AVG per kpi). */
  portfolio: Record<string, NormalisedKpi>
  invalidate: () => Promise<void>
}

function pretty(id: string) {
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * @param period Optional explicit period filter. When omitted, every period
 * present in the backend's data is used (no hardcoded "2025-2026" guess).
 */
export function usePortfolioKpis(period?: string): UsePortfolioKpisResult {
  const queryClient = useQueryClient()

  // GET /kpis/ once — this single call gives us every company, every period,
  // every KPI. We derive companies + per-company maps from it locally instead
  // of making a /companies call (doesn't exist) or N separate per-company
  // requests with a possibly-wrong period.
  const allKpisQuery = useQuery({
    queryKey: kpiKeys.all,
    queryFn: getAllKpis,
    staleTime: STALE_TIME,
    retry: 1,
  })

  const allKpis = allKpisQuery.data ?? []

  const filteredKpis = useMemo(() => {
    if (!period) return allKpis
    return allKpis.filter((r) => r.period === period)
  }, [allKpis, period])

  const companies = useMemo<Company[]>(() => {
    const ids = Array.from(new Set(filteredKpis.map((r) => r.company_id).filter(Boolean)))
    return ids
      .map((id) => ({ id, label: pretty(id) }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [filteredKpis])

  const perCompanyRaw = useMemo(() => {
    const out: Record<string, RawKpi[]> = {}
    for (const row of filteredKpis) {
      if (!row.company_id) continue
      ;(out[row.company_id] ??= []).push(row)
    }
    return out
  }, [filteredKpis])

  const perCompany = useMemo(() => {
    const out: Record<string, Record<string, NormalisedKpi>> = {}
    for (const c of companies) {
      out[c.id] = normaliseKpiList(perCompanyRaw[c.id] ?? [])
    }
    return out
  }, [companies, perCompanyRaw])

  const portfolio = useMemo(
    () => aggregatePortfolio(perCompanyRaw, period ?? DEFAULT_PERIOD),
    [perCompanyRaw, period],
  )

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: kpiKeys.all })
  }

  return {
    companies,
    isLoadingCompanies: allKpisQuery.isLoading,
    isLoadingKpis: allKpisQuery.isLoading,
    isFetching: allKpisQuery.isFetching,
    error: allKpisQuery.error as Error | null,
    perCompany,
    portfolio,
    invalidate,
  }
}

/** Convenience selector: returns kpis for a context id (company id or "all"). */
export function selectContextKpis(
  result: UsePortfolioKpisResult,
  contextId: string,
): Record<string, NormalisedKpi> {
  if (contextId === 'all') return result.portfolio
  return result.perCompany[contextId] ?? {}
}

// Re-exported for callers that still want a single-company, single-period
// fetch (e.g. a detail drilldown screen) without pulling the whole dataset.
export { getCompanyKPIs }
