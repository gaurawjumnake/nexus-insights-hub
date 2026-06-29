/**
 * useApiHealth.ts
 * Lightweight backend reachability check against GET /kpis/.
 * Cached for 60s, retries failed requests once.
 * Re-runs when the API base URL changes (sidebar config).
 */
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { buildApiUrl, API_BASE_URL_EVENT } from '@/config/api'

export type ApiHealthStatus = 'connected' | 'empty' | 'offline'

export interface ApiHealthResult {
  status: ApiHealthStatus
  checkedAt: number
}

async function probe(): Promise<ApiHealthResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    // Use the dedicated /health endpoint — no Content-Type header on a GET
    // (that triggers a CORS preflight which may fail on some backends).
    const res = await fetch(buildApiUrl('/health'), {
      signal: controller.signal,
    })
    if (!res.ok) {
      return { status: 'offline', checkedAt: Date.now() }
    }
    return { status: 'connected', checkedAt: Date.now() }
  } catch {
    return { status: 'offline', checkedAt: Date.now() }
  } finally {
    clearTimeout(timeout)
  }
}

export function useApiHealth() {
  const qc = useQueryClient()
  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ['api-health'] })
    }
    window.addEventListener(API_BASE_URL_EVENT, handler)
    return () => window.removeEventListener(API_BASE_URL_EVENT, handler)
  }, [qc])

  return useQuery({
    queryKey: ['api-health'],
    queryFn: probe,
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Retry aggressively when offline, back off once connected.
    refetchInterval: (query) =>
      query.state.data?.status === 'offline' ? 10_000 : 60_000,
    retry: false,
  })
}
