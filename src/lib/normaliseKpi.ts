/**
 * normaliseKpi.ts
 *
 * WHERE TO ADD:
 *   src/lib/normaliseKpi.ts   (or src/utils/normaliseKpi.ts)
 *
 * Run once on every raw KPI object the moment it arrives from the API,
 * before any component ever touches the data.
 *
 * Handles every data-quality issue found in kpis_export.json:
 *   - value: null                       → isNull: true
 *   - status starts with "error:"       → isError: true, value forced null
 *   - string error codes ("EVAL-22041") → isError: true, value forced null
 *   - percentile strings ("p25: 52…")   → isString: true, kept as-is for display
 *   - raw floats (9.204693611473273)    → rounded per KPI type
 */

// ─── Raw shape from GET /kpis/{company_id}/{period} ──────────────────────────

export interface RawKpi {
  kpi_id: string
  company_id: string
  value: number | string | null
  coverage: number
  status: string
  period: string
  timestamp: string
}

// ─── Normalised shape consumed by every component ────────────────────────────

export interface NormalisedKpi {
  id: string
  company_id: string
  period: string
  /** Cleaned numeric value, or null if missing / errored */
  value: number | null
  /** Ready-to-display string — never expose raw floats to JSX */
  display: string
  /** True when value is null OR status is an error */
  isNull: boolean
  /** True when backend returned a calc error (AST, EVAL codes, etc.) */
  isError: boolean
  /** True when backend returned a percentile string instead of a number */
  isString: boolean
  /** Raw string value when isString is true */
  rawString: string | null
  coverage: number
  status: string
}

// ─── KPI IDs that are percentages — format as "X%" ───────────────────────────

const PERCENT_KEYS = new Set([
  'adoption_yoy_growth',
  'availability_uptime',
  'data_privacy_compliance',
  'ebitda_uplift',
  'percent_ai_in_production',
  'policy_compliance_rate',
  'productivity_gain',
  'regulatory_readiness',
  'human_review_coverage',
  'budget_adherence',
  'vendor_compliance',
  'error_rate',
  'fallback_rate',
  'api_success_rate',
])

// ─── KPI IDs that are currency (USD) — format as "$X.XM" / "$XK" ─────────────

const CURRENCY_KEYS = new Set([
  'ai_revenue',
  'ai_assisted_revenue',
  'direct_ai_revenue',
  'pipeline_influenced_revenue',
  'cross_sell_uplift',
  'cost_savings',
  'total_ai_spend',
  'forecasted_ai_spend',
  'cloud_spend',
  'api_licensing_spend',
  'budget_variance',
  'cost_per_outcome',
])

// ─── KPI IDs that are scores out of 100 ──────────────────────────────────────

const SCORE_100_KEYS = new Set([
  'ai_governance_score',
  'portfolio_ai_adoption_score',
  'top_quartile_position',
  'governance_rank',
  'portfolio_benchmark_score',
])

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strings that look like backend error codes rather than real values */
function isErrorString(v: string): boolean {
  return /^EVAL-\d+$/i.test(v) || v.startsWith('error:')
}

/** Percentile strings like "p25: 52, p50: 68, p75: 84" */
function isPercentileString(v: string): boolean {
  return /p\d+:/i.test(v)
}

function formatCurrency(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`
  return `${sign}$${abs.toFixed(2)}`
}

function formatDisplay(id: string, value: number): string {
  if (CURRENCY_KEYS.has(id)) return formatCurrency(value)
  if (PERCENT_KEYS.has(id)) return `${value.toFixed(1)}%`
  if (SCORE_100_KEYS.has(id)) return `${Math.round(value)}/100`

  // Multipliers (ROI, ratios, benchmarks)
  if (id === 'ai_roi' || id === 'industry_benchmark_ratio' || id === 'production_ratio')
    return `${value.toFixed(2)}x`

  // Latency — milliseconds
  if (id === 'p95_latency') return `${Math.round(value)} ms`

  // Mean time to resolve — minutes
  if (id === 'mttr') return `${value.toFixed(1)} min`

  // Incident rate — round to 1 decimal
  if (id === 'ai_incident_rate') return value.toFixed(1)

  // Payback period — months
  if (id === 'payback_period') return `${value.toFixed(1)} mo`

  // Scores out of 5
  if (
    id === 'ai_maturity_score' ||
    id === 'strategic_alignment_score' ||
    id === 'technical_maturity_score' ||
    id === 'talent_readiness_score' ||
    id === 'governance_maturity_score' ||
    id === 'company_maturity_rank'
  )
    return `${value.toFixed(1)}/5`

  // Counts — whole numbers
  if (
    id === 'active_ai_users' ||
    id === 'copilot_adoption' ||
    id === 'custom_agent_adoption' ||
    id === 'embedded_analytics_adoption' ||
    id === 'power_user_ratio' ||
    id === 'critical_incident_count' ||
    id === 'total_ai_projects' ||
    id === 'projects_in_production' ||
    id === 'projects_in_poc' ||
    id === 'stalled_projects'
  )
    return String(Math.round(value))

  // Default: 2 decimal places
  return value.toFixed(2)
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function normaliseKpi(raw: RawKpi): NormalisedKpi {
  const base = {
    id: raw.kpi_id,
    company_id: raw.company_id,
    period: raw.period,
    coverage: raw.coverage,
    status: raw.status,
  }

  // 1. Status is a calc error — value is unreliable even if non-null
  const statusIsError = raw.status.startsWith('error:')
  if (statusIsError) {
    return {
      ...base,
      value: null,
      display: '—',
      isNull: true,
      isError: true,
      isString: false,
      rawString: null,
    }
  }

  // 2. Value is null
  if (raw.value === null) {
    return {
      ...base,
      value: null,
      display: '—',
      isNull: true,
      isError: false,
      isString: false,
      rawString: null,
    }
  }

  // 3. Value is a string
  if (typeof raw.value === 'string') {
    // Error code strings ("EVAL-22041")
    if (isErrorString(raw.value)) {
      return {
        ...base,
        value: null,
        display: '—',
        isNull: true,
        isError: true,
        isString: false,
        rawString: raw.value,
      }
    }
    // Percentile strings ("p25: 52, p50: 68, p75: 84")
    if (isPercentileString(raw.value)) {
      return {
        ...base,
        value: null,
        display: raw.value, // components render this as-is
        isNull: false,
        isError: false,
        isString: true,
        rawString: raw.value,
      }
    }
    // Unknown string — treat as null to be safe
    return {
      ...base,
      value: null,
      display: '—',
      isNull: true,
      isError: false,
      isString: true,
      rawString: raw.value,
    }
  }

  // 4. Value is a number — round and format
  const rounded = parseFloat(raw.value.toFixed(10)) // strip float noise first
  const display = formatDisplay(raw.kpi_id, rounded)

  return {
    ...base,
    value: rounded,
    display,
    isNull: false,
    isError: false,
    isString: false,
    rawString: null,
  }
}

// ─── Batch helper — use inside the Query hook ─────────────────────────────────

/** Returns a lookup map: { [kpi_id]: NormalisedKpi } */
export function normaliseKpiList(list: RawKpi[]): Record<string, NormalisedKpi> {
  return Object.fromEntries(list.map((r) => [r.kpi_id, normaliseKpi(r)]))
}

// ─── Safe accessor — returns display string or fallback ───────────────────────

/**
 * Use in JSX:
 *   kpi(kpis, 'ai_revenue')           → "$18.4M"
 *   kpi(kpis, 'active_ai_users', '—') → "—"  (when null)
 */
export function kpi(
  map: Record<string, NormalisedKpi>,
  id: string,
  fallback = '—',
): string {
  return map[id]?.display ?? fallback
}

/**
 * Returns the raw numeric value or null.
 * Use when you need the number for charts / calculations.
 */
export function kpiValue(
  map: Record<string, NormalisedKpi>,
  id: string,
): number | null {
  return map[id]?.value ?? null
}

/**
 * Returns true if the KPI has real data (not null, not error).
 * Use to conditionally show/hide sub-rows in cards.
 */
export function kpiHasData(map: Record<string, NormalisedKpi>, id: string): boolean {
  const k = map[id]
  return !!k && !k.isNull && !k.isError
}
