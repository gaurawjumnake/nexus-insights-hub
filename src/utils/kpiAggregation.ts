/**
 * kpiAggregation.ts
 * Portfolio-level rollup logic. Backend stores KPIs at company level;
 * when the user picks "All" we aggregate here.
 */
import { normaliseKpi, type NormalisedKpi, type RawKpi } from '@/lib/normaliseKpi'

/** KPIs that should be summed across the portfolio. */
export const SUM_KPIS = new Set([
  'ai_revenue',
  'cost_savings',
  'cross_sell_uplift',
  'total_ai_spend',
  'budget_variance',
  'forecasted_ai_spend',
  'copilot_adoption',
  'custom_agent_adoption',
  'embedded_analytics_adoption',
  'power_user_ratio',
  'active_ai_users',
  'direct_ai_revenue',
  'ai_assisted_revenue',
  'pipeline_influenced_revenue',
  'cloud_spend',
  'api_licensing_spend',
  'total_ai_projects',
  'projects_in_production',
  'projects_in_poc',
  'stalled_projects',
])

/** KPIs that should be averaged across the portfolio. */
export const AVG_KPIS = new Set([
  'ai_roi',
  'ebitda_uplift',
  'productivity_gain',
  'availability_uptime',
  'policy_compliance_rate',
  'data_privacy_compliance',
  'ai_maturity_score',
  'technical_maturity_score',
  'governance_maturity_score',
  'talent_readiness_score',
  'strategic_alignment_score',
  'portfolio_ai_adoption_score',
  'ai_governance_score',
  'governance_rank',
  'regulatory_readiness',
  'human_review_coverage',
  'budget_adherence',
  'vendor_compliance',
  'api_success_rate',
  'error_rate',
  'fallback_rate',
  'percent_ai_in_production',
  'top_quartile_position',
  'industry_benchmark_ratio',
  'production_ratio',
  'cost_per_outcome',
  'adoption_yoy_growth',
])

function aggregateMode(kpiId: string): 'sum' | 'avg' {
  if (SUM_KPIS.has(kpiId)) return 'sum'
  if (AVG_KPIS.has(kpiId)) return 'avg'
  // default: average (safer for unknown ratios/scores)
  return 'avg'
}

/** Combine raw KPI records across companies into a single normalised map. */
export function aggregatePortfolio(
  perCompany: Record<string, RawKpi[]>,
  period?: string,
): Record<string, NormalisedKpi> {
  const buckets = new Map<string, RawKpi[]>()
  for (const list of Object.values(perCompany)) {
    for (const raw of list) {
      // skip nulls and errored statuses
      if (raw.value === null) continue
      if (typeof raw.status === 'string' && raw.status.startsWith('error')) continue
      if (typeof raw.status === 'string' && raw.status === 'insufficient_data') continue
      if (!buckets.has(raw.kpi_id)) buckets.set(raw.kpi_id, [])
      buckets.get(raw.kpi_id)!.push(raw)
    }
  }

  const out: Record<string, NormalisedKpi> = {}
  for (const [kpiId, rows] of buckets.entries()) {
    const numbers = rows
      .map((r) => (typeof r.value === 'number' ? r.value : null))
      .filter((v): v is number => v !== null && !Number.isNaN(v))
    if (!numbers.length) continue

    const mode = aggregateMode(kpiId)
    const value =
      mode === 'sum'
        ? numbers.reduce((a, b) => a + b, 0)
        : numbers.reduce((a, b) => a + b, 0) / numbers.length

    const synthetic: RawKpi = {
      kpi_id: kpiId,
      company_id: 'portfolio',
      value,
      coverage: numbers.length / Math.max(1, rows.length),
      status: 'calculated',
      period: period ?? rows[0].period,
      timestamp: new Date().toISOString(),
    }
    out[kpiId] = normaliseKpi(synthetic)
  }
  return out
}
