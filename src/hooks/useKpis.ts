/**
 * useKpis.ts
 *
 * WHERE TO ADD:
 *   src/hooks/useKpis.ts
 *
 * TanStack Query hook that:
 *   1. Fetches GET /kpis/{company_id}/{period}
 *   2. Normalises every item via normaliseKpiList()
 *   3. Returns a keyed map so components do kpis['ai_revenue'] not .find()
 *   4. Exposes invalidate() for the doc-upload pipeline to bust the cache
 *
 * PREREQUISITES:
 *   npm install @tanstack/react-query
 *
 * SETUP (do once in src/main.tsx or src/app/layout.tsx):
 *   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
 *   const queryClient = new QueryClient()
 *   <QueryClientProvider client={queryClient}>
 *     <App />
 *   </QueryClientProvider>
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { normaliseKpiList, type NormalisedKpi, type RawKpi } from '@/lib/normaliseKpi'
import { getApiBaseUrl } from '@/config/api'

// ─── Config ──────────────────────────────────────────────────────────────────

/** Cache stays fresh for 2 minutes; background refetch after that */
const STALE_TIME = 2 * 60 * 1000

// ─── Query key factory — keeps keys consistent across the app ─────────────────

export const kpiKeys = {
  all: ['kpis'] as const,
  byCompanyPeriod: (companyId: string, period: string) =>
    ['kpis', companyId, period] as const,
}

// ─── Fetcher ─────────────────────────────────────────────────────────────────

async function fetchKpis(companyId: string, period: string): Promise<RawKpi[]> {
  const url = `${getApiBaseUrl()}/kpis/${encodeURIComponent(companyId)}/${encodeURIComponent(period)}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`KPI fetch failed [${res.status}]: ${body}`)
  }

  const data = await res.json()

  // API returns either a plain array or { items: [...] } — handle both
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  throw new Error('Unexpected KPI response shape — expected array or { items: [] }')
}

// ─── Return type ─────────────────────────────────────────────────────────────

export interface UseKpisResult {
  /** Keyed map: { [kpi_id]: NormalisedKpi } — main thing components use */
  kpis: Record<string, NormalisedKpi>
  /** True on first load before any data arrives */
  isLoading: boolean
  /** True when a background refetch is running (data already present) */
  isFetching: boolean
  /** Set when the fetch itself fails (network error, 4xx, 5xx) */
  error: Error | null
  /** Call this after POST /kpis/calculate completes to refetch all screens */
  invalidate: () => Promise<void>
  /** Timestamp of last successful fetch */
  dataUpdatedAt: number
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Usage:
 *   const { kpis, isLoading, error } = useKpis('novamind', '2025-2026')
 *   <span>{kpis['ai_revenue']?.display ?? '—'}</span>
 *
 *   Or with the helper:
 *   import { kpi } from '@/lib/normaliseKpi'
 *   <span>{kpi(kpis, 'ai_revenue')}</span>
 */
export function useKpis(companyId: string, period: string): UseKpisResult {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: kpiKeys.byCompanyPeriod(companyId, period),
    queryFn: () => fetchKpis(companyId, period),
    staleTime: STALE_TIME,
    // Don't throw on error — let the UI handle gracefully
    throwOnError: false,
    // Keep previous data visible while new data loads (e.g. switching company)
    placeholderData: (prev) => prev,
    // Retry once on network failure, not on 4xx
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('[4')) return false
      return failureCount < 1
    },
    // Enabled only when both params are provided
    enabled: Boolean(companyId && period),
    // Select normalises the raw array into a keyed map
    select: (data) => normaliseKpiList(data),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: kpiKeys.byCompanyPeriod(companyId, period),
    })
  }

  return {
    kpis: query.data ?? {},
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    invalidate,
    dataUpdatedAt: query.dataUpdatedAt,
  }
}

// ─── Prefetch helper — call in loaders or on hover ───────────────────────────

/**
 * Prefetch KPIs for a company+period before the user navigates there.
 * Call in your router loader or on mouseenter of a PortCo card.
 *
 * Usage (React Router v6 loader):
 *   export async function loader({ params }) {
 *     await prefetchKpis(queryClient, params.companyId, params.period)
 *   }
 */
export async function prefetchKpis(
  queryClient: ReturnType<typeof useQueryClient>,
  companyId: string,
  period: string,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: kpiKeys.byCompanyPeriod(companyId, period),
    queryFn: () => fetchKpis(companyId, period),
    staleTime: STALE_TIME,
  })
}
