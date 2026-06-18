/**
 * kpiMapper.ts
 * Convert raw KPI lists into a company-keyed map of normalised KPIs.
 */
import { normaliseKpiList, type NormalisedKpi, type RawKpi } from '@/lib/normaliseKpi'

export interface CompanyKpiBundle {
  companyId: string
  kpis: Record<string, NormalisedKpi>
}

/** Build { [companyId]: { [kpi_id]: NormalisedKpi } } */
export function mapKpisByCompany(
  perCompany: Record<string, RawKpi[]>,
): Record<string, Record<string, NormalisedKpi>> {
  const out: Record<string, Record<string, NormalisedKpi>> = {}
  for (const [companyId, list] of Object.entries(perCompany)) {
    out[companyId] = normaliseKpiList(list)
  }
  return out
}
