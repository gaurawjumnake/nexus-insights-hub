/**
 * useApiHealth.ts
 * Lightweight backend reachability check against GET /kpis.
 * Cached for 60s, retries failed requests once.
 * Re-runs when the API base URL changes (sidebar config).
 */
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiBaseUrl, API_BASE_URL_EVENT } from '@/config/api'

export type ApiHealthStatus = 'connected' | 'empty' | 'offline'

export interface ApiHealthResult {
  status: ApiHealthStatus
  checkedAt: number
}

async function probe(): Promise<ApiHealthResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(`${getApiBaseUrl()}/kpis`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })
    if (res.status >= 500) {
      return { status: 'offline', checkedAt: Date.now() }
    }
    if (!res.ok) {
      return { status: 'empty', checkedAt: Date.now() }
    }
    const data = await res.json().catch(() => null)
    const list: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] })?.items)
        ? (data as { items: unknown[] }).items
        : []
    return {
      status: list.length > 0 ? 'connected' : 'empty',
      checkedAt: Date.now(),
    }
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
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  })
}
