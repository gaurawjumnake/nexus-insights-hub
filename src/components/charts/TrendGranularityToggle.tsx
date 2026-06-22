/**
 * TrendGranularityToggle.tsx
 *
 * The Monthly / Quarterly / Annual button group, extracted from its
 * original inline implementation in workforce.business.tsx so other
 * dashboard charts (operations, technology, productivity, compare, ...)
 * can reuse the exact same control instead of re-implementing it.
 *
 * Visual style is unchanged from the original inline version - this is
 * a pure extraction, not a redesign.
 */
import type { Grain } from '@/lib/periods'

const OPTIONS: readonly [Grain, string][] = [
  ['M', 'Monthly'],
  ['Q', 'Quarterly'],
  ['A', 'Annual'],
]

export function TrendGranularityToggle({
  value,
  onChange,
}: {
  value: Grain
  onChange: (grain: Grain) => void
}) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium">
      {OPTIONS.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`px-2.5 py-1 rounded ${
            value === id ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
