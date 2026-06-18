/**
 * kpiService.ts
 * Thin HTTP layer for the KPI pipeline.
 * All endpoints are configurable via VITE_API_BASE_URL.
 */
import type { RawKpi } from '@/lib/normaliseKpi'
import { getApiBaseUrl } from '@/config/api'

const API_BASE = () => getApiBaseUrl()

/** Companies known to the demo portfolio. Used as a fallback when
 *  the backend doesn't expose a /companies index. */
export const FALLBACK_COMPANIES = [
  { id: 'gordian', label: 'Gordian', sector: 'Construction Cost Data' },
  { id: 'provation', label: 'Provation', sector: 'Healthcare SaaS' },
  { id: 'fluke', label: 'Fluke', sector: 'Industrial Test & Measure' },
]

export const DEFAULT_PERIOD = '2025-2026'

export interface Company {
  id: string
  label: string
  sector?: string
}

function pretty(id: string) {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

/** Try GET /companies; if backend doesn't ship it, fall back to known list. */
export async function getCompanies(): Promise<Company[]> {
  try {
    const res = await fetch(`${API_BASE()}/companies`, {
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    const list: unknown[] = Array.isArray(data) ? data : data?.items ?? []
    if (!list.length) return FALLBACK_COMPANIES
    return list.map((item) => {
      if (typeof item === 'string') return { id: item, label: pretty(item) }
      const obj = item as Record<string, unknown>
      const id = String(obj.id ?? obj.company_id ?? obj.name ?? '')
      const label = String(obj.label ?? obj.display_name ?? obj.name ?? pretty(id))
      const sector = obj.sector ? String(obj.sector) : undefined
      return { id, label, sector }
    }).filter((c) => c.id)
  } catch {
    return FALLBACK_COMPANIES
  }
}

/** GET /kpis/{company_id}/{period} → RawKpi[] */
export async function getCompanyKPIs(
  companyId: string,
  period: string = DEFAULT_PERIOD,
): Promise<RawKpi[]> {
  const url = `${API_BASE()}/kpis/${encodeURIComponent(companyId)}/${encodeURIComponent(period)}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`KPI fetch failed [${res.status}]: ${body}`)
  }
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  return []
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
