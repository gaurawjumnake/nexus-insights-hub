/**
 * usePortfolioKpis.ts
 *
 * Single source of truth for the executive dashboard + compare screen.
 * - Loads /companies (with fallback) via TanStack Query
 * - Loads /kpis/{company}/{period} for every company in parallel
 * - Exposes per-company maps + portfolio aggregate
 */
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query'
import {
  getCompanies,
  getCompanyKPIs,
  DEFAULT_PERIOD,
  type Company,
} from '@/services/kpiService'
import { normaliseKpiList, type NormalisedKpi } from '@/lib/normaliseKpi'
import { aggregatePortfolio } from '@/utils/kpiAggregation'
import { useMemo } from 'react'

const STALE_TIME = 2 * 60 * 1000

export const kpiKeys = {
  companies: ['kpi-companies'] as const,
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

export function usePortfolioKpis(
  period: string = DEFAULT_PERIOD,
): UsePortfolioKpisResult {
  const queryClient = useQueryClient()

  const companiesQuery = useQuery({
    queryKey: kpiKeys.companies,
    queryFn: getCompanies,
    staleTime: 10 * 60 * 1000,
  })

  const companies = companiesQuery.data ?? []

  const kpiQueries = useQueries({
    queries: companies.map((c) => ({
      queryKey: kpiKeys.kpis(c.id, period),
      queryFn: () => getCompanyKPIs(c.id, period),
      staleTime: STALE_TIME,
      retry: 1,
    })),
  })

  const perCompany = useMemo(() => {
    const out: Record<string, Record<string, NormalisedKpi>> = {}
    companies.forEach((c, i) => {
      const data = kpiQueries[i]?.data ?? []
      out[c.id] = normaliseKpiList(data)
    })
    return out
  }, [companies, kpiQueries])

  const portfolio = useMemo(() => {
    const raw: Record<string, ReturnType<typeof Object>> = {}
    companies.forEach((c, i) => {
      const data = kpiQueries[i]?.data ?? []
      raw[c.id] = data as never
    })
    return aggregatePortfolio(raw as never, period)
  }, [companies, kpiQueries, period])

  const isLoadingKpis = kpiQueries.some((q) => q.isLoading)
  const isFetching =
    companiesQuery.isFetching || kpiQueries.some((q) => q.isFetching)
  const firstErr =
    (companiesQuery.error as Error | null) ??
    (kpiQueries.find((q) => q.error)?.error as Error | null) ??
    null

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['kpis'] })
    await queryClient.invalidateQueries({ queryKey: kpiKeys.companies })
  }

  return {
    companies,
    isLoadingCompanies: companiesQuery.isLoading,
    isLoadingKpis,
    isFetching,
    error: firstErr,
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
