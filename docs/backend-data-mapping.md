# Backend Data Mapping — AI Value Cockpit

This document summarizes every UI data block currently hard-coded in the frontend, so the backend team can design tables / API endpoints that map 1:1 to what the screens render. Each block lists: **source file**, **constant name**, **shape / fields**, **suggested API endpoint**, and **suggested DB table**.

All monetary fields are stored as numbers in DB (e.g. `numeric(14,2)`); the UI formats them (`$22.7M`, `+34%`, `9.2 mo`). Persona enum: `cxo | business | technology | operations`.

---

## 0. Global / Shared

| Concept | Where | Notes |
|---|---|---|
| Persona list | `src/routes/index.tsx` `PERSONAS` | Static enum — no API needed. |
| Sub-tabs (All / Revenue / EBITDA / Adoption / Risk / Efficiency) | `src/routes/index.tsx` `SUBTABS` | Static filter keys passed as query param `?tab=`. |
| Portfolio company list | Referenced everywhere (`Provation, Fluke, Gordon, Aldevron, Catalent`) | Single source of truth → `companies` table (`id, name, sector, logo`). Every other table FKs `company_id`. |

Suggested core lookup tables: `companies`, `functions` (Sales/Marketing/…), `use_cases`, `personas`.

---

## 1. Landing dashboard (`/`) — `src/routes/index.tsx`

### 1a. Persona tile grid — `TILES: Record<Persona, Section[]>`
Shape per tile:
```ts
Tile = {
  title: string;
  tag?: string; tagTone: "teal"|"indigo"|"violet"|"amber"|"blue"|"green";
  accent: same union;
  rows: { label: string; value: string; delta?: string; deltaTone?: "up"|"down"|"neutral" }[];
  footer?: string;
}
```
- **Endpoint:** `GET /api/personas/:persona/tiles?tab=all`
- **Tables:**
  - `persona_sections (id, persona, sub_tab, section_title, sort)`
  - `persona_tiles (id, section_id, title, tag, tag_tone, accent, footer, sort)`
  - `persona_tile_rows (id, tile_id, label, value, delta, delta_tone, sort)`

### 1b. Executive summary strip — `SUMMARY`
Array of `{ label, value, delta }`. → `GET /api/summary?persona=`. Table: `executive_summary_kpis(persona, label, value, delta, sort)`.

---

## 2. Workforce overview (`/workforce`) — `src/routes/workforce.index.tsx`
- `KPIS` → `workforce_kpis(label, value, delta, icon_key, tone)`
- `ADVISOR_QUESTIONS` → `advisor_questions(id, persona, question, answer, kpi, action, value)`
- `RECOMMENDATIONS` → `recommendations(id, persona, title, rationale, value, confidence, priority)`
- `RISKS` → `risks(id, persona, title, severity, owner, mitigation)`
- `OPPORTUNITIES` → `opportunities(id, persona, name, ebitda, roi, difficulty, companies[])`

Endpoint: `GET /api/workforce/overview`.

---

## 3. Business persona (`/workforce/business`) — `src/routes/workforce.business.tsx`

| Constant | Purpose | Suggested table |
|---|---|---|
| `EXEC_KPIS` | 6 hero KPIs (AI Revenue, Uplift %, EBITDA, ROI, Payback, Use Cases) | `business_exec_kpis(metric_key, value, trend, footer, accent, trend_direction)` |
| `REV_KPIS` | 4 revenue KPIs | `business_revenue_kpis` |
| `REV_TREND_MONTHLY` / `QUARTERLY` / `ANNUAL` | Line chart `{p, direct, assisted}` | `business_revenue_trend(period_key, granularity, direct, assisted)` |
| `REV_BY_COMPANY` | Bar `{company, value}` | `business_revenue_by_company(company_id, value, period)` |
| `REV_BY_USECASE` | Bar `{name, value}` | `business_revenue_by_usecase(use_case_id, value, period)` |
| `REV_BREAKDOWN` | Pie `{name, value, color}` (function share) | `business_revenue_by_function(function_id, share_pct, period)` |
| `EBITDA_KPIS` | 4 EBITDA KPIs | `business_ebitda_kpis` |
| `EBITDA_BY_COMPANY` | Bar `{company, value}` | `business_ebitda_by_company(company_id, value, period)` |
| `MARGIN_TREND` | Line `{p, margin}` | `business_margin_trend(period, margin_pct)` |
| `COST_VS_VALUE` | Dual-line `{p, cost, value}` | `business_cost_vs_value(period, cost, value)` |
| `ROI_COMPARE` | Bar `{company, roi}` | `business_roi_by_company(company_id, roi, period)` |
| `WATERFALL` | Bridge `{name, value, color}` (Rev Gain + Cost Red − Investment = EBITDA) | `business_waterfall(step_name, value, sort, period)` |
| `FUNCTIONS` (`Fn[]`) | Per-function scorecards with `metrics[{k,v,t}]` | `function_scorecards(function_id, trend, bench, tone)` + `function_metrics(scorecard_id, key, value, delta, sort)` |
| `REPLICATION` | PE replication play table | `replication_plays(source_company_id, use_case_id, benefit, target_company_id, ebitda, roi, priority, score)` |
| `ADVISOR_RECS` | AI recommendations | `recommendations` (reuse, scoped persona=business) |
| `OPPORTUNITIES` | `{name, company, ebitda, roi, difficulty}` | `opportunities` |
| `PE_QUESTIONS` | `{q, a, kpi, action, value}` | `advisor_questions` |

Endpoint group: `GET /api/business/{exec-kpis|revenue|ebitda|functions|replication|advisor|opportunities|qa}`.

---

## 4. Technology persona (`/workforce/technology`) — `src/routes/workforce.technology.tsx`

| Constant | Purpose | Suggested table |
|---|---|---|
| `EXEC_KPIS` | Hero KPIs (availability, AI spend, latency, governance) | `tech_exec_kpis` |
| `PLATFORM_KPIS`, `PLATFORM_TREND` | Platform health (uptime, MTTR over time) | `tech_platform_kpis`, `tech_platform_trend(period, availability, mttr, incidents)` |
| `PORTFOLIO_HEALTH` | Company-level health rows | `tech_portfolio_health(company_id, availability, mttr, incidents, status)` |
| `MODEL_KPIS` | LLM portfolio KPIs | `tech_model_kpis` |
| `MODELS` | Per-model usage `{name, provider, cost, tokens, quality, share}` | `models(name, provider)` + `model_usage(model_id, period, cost, tokens, quality_score, share_pct)` |
| `COST_BY_MODEL`, `QUALITY_VS_COST` | Derived views over `models` | view only |
| `APP_KPIS`, `LIFECYCLE`, `APPS_BY_COMPANY`, `APPS_BY_FUNCTION`, `AGENT_TREND`, `APP_INVENTORY` | AI app/agent inventory | `ai_apps(id, name, company_id, function_id, lifecycle_stage, health_score, owner, …)` + aggregates |
| `RELIABILITY_KPIS`, `INCIDENT_TREND`, `RELIABILITY_RANK`, `INCIDENTS` | Incidents | `incidents(id, company_id, severity, opened_at, resolved_at, mttr, summary)` |
| `GOV_KPIS`, `COMPLIANCE_TREND`, `RISK_MATRIX` | Governance & risk | `governance_kpis`, `compliance_trend(period, score)`, `risk_matrix(category, severity, count)` |
| `FINOPS_KPIS`, `SPEND_TREND`, `SPEND_BY_COMPANY`, `OPTIMIZATIONS`, `DEBT` | FinOps & tech debt | `ai_spend(company_id, period, budget, actual)`, `optimizations(title, savings_annual, effort, owner)`, `tech_debt(item, severity, owner, eta)` |
| `ADVISOR`, `CTO_QUESTIONS` | recommendations + Q&A | reuse `recommendations`, `advisor_questions` |

Endpoint group: `GET /api/technology/{exec-kpis|platform|models|apps|reliability|governance|finops|debt|advisor|qa}`.

---

## 5. Operations persona (`/workforce/operations`) — `src/routes/workforce.operations.tsx`

| Constant | Purpose | Suggested table |
|---|---|---|
| `EXEC_KPIS` | Hero KPIs (Active Programs, Benefits Realized, Risk score) | `ops_exec_kpis` |
| `PROGRAM_KPIS`, `PROGRAM_STATUS`, `DELIVERY_TREND`, `PROGRAM_ROWS` | Programs | `programs(id, name, company_id, stage, status, start_date, target_date, owner, benefits_planned, benefits_actual)` |
| `ADOPTION_KPIS`, `ADOPTION_TREND`, `ADOPTION_BY_COMPANY`, `ADOPTION_BY_DEPT`, `MATURITY_HEATMAP` | Adoption & maturity | `adoption_metrics(company_id, dept, period, active_users, total_users, maturity_stage)` |
| `PRODUCTIVITY_KPIS`, `HOURS_TREND`, `PRODUCTIVITY_BY_COMPANY`, `PROCESS_RANKING` | Productivity / FTE | `productivity_metrics(company_id, period, fte_equiv, hours_saved, automation_pct)` |
| `BENEFITS_KPIS`, `PLANNED_VS_ACTUAL`, `REALIZATION_ROWS` | Benefits realization | `benefits_realization(program_id, planned, actual, roi_planned, roi_actual)` |
| `RISK_KPIS`, `RISK_HEATMAP`, `ESCALATIONS` | Risk | `risk_heatmap(company_id, category, severity, count)`, `escalations(id, company_id, title, severity, owner, mitigation, due)` |
| `TRANSFORMATION_KPIS`, `PORTFOLIO_RANKING`, `MATURITY_PROGRESSION`, `SCORECARD` | Transformation scoreboard | `transformation_scorecard(company_id, maturity, adoption, value, rank, period)` |
| `RECOMMENDATIONS`, `PARTNER_QUESTIONS`, `PLAYBOOK` | Recos / Q&A / PE replication | reuse `recommendations`, `advisor_questions`, `replication_plays` |

Endpoint group: `GET /api/operations/{exec-kpis|programs|adoption|productivity|benefits|risk|scorecard|playbook|advisor|qa}`.

---

## 6. Other workforce sub-pages

| Route | Constants | Tables |
|---|---|---|
| `/workforce/ai-adoption` | `KPIS`, `MATRIX`, `HEATMAP`, `GAPS` | `adoption_tool_matrix(company_id, tool, adoption_pct, active_users, trend)`, `skill_heatmap(company_id, skill, level, count)`, `skill_gaps(skill, current, target, priority)` |
| `/workforce/agent-center` | inventory + lifecycle | reuse `ai_apps` |
| `/workforce/data-management` | data sources & quality | `data_sources(name, type, owner, quality_score, freshness)` |
| `/workforce/portfolio` | portfolio rollup | views over `companies` + KPIs |
| `/workforce/productivity` | productivity rollup | reuse `productivity_metrics` |
| `/workforce/talent-risk` | risk per role | `talent_risk(role, company_id, risk_score, drivers[])` |
| `/workforce/workforce-drilldown` | per-employee/role drill | `workforce_roles(company_id, role, headcount, ai_augmented_pct, automation_risk)` |

---

## 7. Cross-cutting suggested schema

```
companies(id, name, sector, logo_url, sort)
functions(id, key, label)
use_cases(id, name, function_id)
periods(period_key, granularity)   -- 'Jan', 'Q1', '2024'
personas (enum)
sub_tabs (enum)

recommendations(id, persona, title, rationale, value, confidence, priority, created_at)
advisor_questions(id, persona, question, answer, kpi, action, value, sort)
opportunities(id, persona, name, ebitda, roi, difficulty, companies[])
replication_plays(id, source_company_id, target_company_id, use_case_id,
                  benefit, ebitda, roi, priority, score)
```

Every KPI table follows the same conventions:
```
*_kpis(metric_key text pk, value text, trend text, footer text,
       accent text, trend_direction text, sort int)
```
The `value` / `trend` are kept as preformatted strings so the API can return one shape regardless of unit (`$`, `%`, `mo`, `x`). If the FE later needs raw numbers add `numeric_value numeric` and `unit text`.

---

## 8. Suggested API shape

```
GET /api/personas                         -> personas + sub_tabs
GET /api/personas/:persona/tiles?tab=     -> landing tile grid
GET /api/business/exec-kpis               -> EXEC_KPIS
GET /api/business/revenue?granularity=    -> KPIs + trend + breakdowns
GET /api/business/ebitda                  -> KPIs + waterfall + roi
GET /api/business/functions               -> FUNCTIONS[]
GET /api/business/replication             -> REPLICATION[]
GET /api/business/advisor                 -> ADVISOR_RECS + OPPORTUNITIES
GET /api/business/qa                      -> PE_QUESTIONS
... same pattern for /technology and /operations
```

All endpoints are read-only `GET`. Writes only needed when the user starts editing recommendations / acknowledging risks — at that point add `POST /api/recommendations/:id/ack`, `PATCH /api/risks/:id`.

---

## 9. Recommended implementation order

1. **Lookup tables** — `companies`, `functions`, `use_cases`, `periods`.
2. **Shared tables** — `recommendations`, `advisor_questions`, `opportunities`, `replication_plays`.
3. **Persona KPI tables** (small, high-impact for the landing page).
4. **Trend / breakdown tables** (charts).
5. **Inventory tables** — `ai_apps`, `models`, `incidents`, `programs`.
6. Wire each `const X = [...]` in the FE to a TanStack Query loader that calls the matching endpoint — replace the literal with `useSuspenseQuery`.

Once Lovable Cloud is enabled we can scaffold these tables + a `createServerFn` per endpoint and migrate the FE constants file-by-file with zero visual change.
