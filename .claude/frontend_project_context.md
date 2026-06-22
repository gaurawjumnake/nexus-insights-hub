# Frontend Project Context (Compact)

## Project
Nexus / PE AI Observability Tower

Purpose: Portfolio-level AI performance, adoption, value realization, governance, and operational monitoring across portfolio companies.

## Stack
- React + TypeScript
- TanStack Router (file-based routing)
- TanStack Query
- Tailwind CSS
- shadcn/ui components
- Recharts (visualizations)
- Lucide React (icons)

## Navigation
Routes:
- /                  -> Executive dashboard
- /workforce         -> Workforce landing
- /workforce/business
- /workforce/technology
- /workforce/operations
- /workforce/portfolio
- /compare
- /upload

Right sidebar provides primary navigation.

## Core Personas

### Business
Focus:
- Revenue
- EBITDA impact
- AI ROI
- Payback period
- Revenue influence
- Sales/Marketing/Service KPIs

### Technology
Focus:
- Platform availability
- Latency
- AI spend
- Governance
- Reliability
- Incidents
- Infrastructure health

### Operations
Focus:
- Program execution
- Adoption
- Productivity
- Benefits realization
- Risk management
- Deployment tracking

### Portfolio
Focus:
- Cross-PortCo benchmarking
- Adoption comparison
- Readiness comparison
- EBITDA impact
- Risk scoring

## UI Architecture

Common patterns:
- KPI cards
- Trend charts
- Benchmark comparisons
- Drilldowns
- Persona-specific dashboards
- Executive summary sections

Shared Components:
- GlassPanel
- KpiCard
- Pill
- RightSidebar

## Design System

Theme:
- Enterprise analytics dashboard
- Card-based layouts
- Data-dense UI
- Executive reporting style

Primary Colors:
- Teal
- Green
- Indigo
- Violet
- Amber
- Blue
- Red

## Data Model

Current state:
- Static/mock data embedded in route files
- No backend-driven KPI loading observed
- Recharts used for visualization

Expected future state:
- KPI Registry
- Fact Registry
- Portfolio-level aggregation
- Benchmark engine
- Drilldown APIs

## Current Strengths
- Clear persona separation
- Reusable dashboard patterns
- Consistent KPI presentation
- Modular routing structure

## Technical Debt / Improvement Areas
- Large route files containing UI + data
- KPI definitions hardcoded
- Missing centralized KPI registry
- Limited component abstraction for dashboard sections
- Mock data mixed with presentation layer

## Recommended Folder Evolution

src/
├── components/
│   ├── dashboard/
│   ├── charts/
│   ├── kpi/
│   └── layout/
├── features/
│   ├── business/
│   ├── technology/
│   ├── operations/
│   └── portfolio/
├── data/
│   ├── kpi-registry/
│   └── benchmarks/
├── services/
├── hooks/
└── routes/

## Lovable Context

When modifying UI:
- Preserve routing
- Preserve persona structure
- Reuse existing KPI cards
- Reuse existing chart patterns
- Modify only requested dashboard
- Avoid changes to shared navigation/layout unless explicitly requested
