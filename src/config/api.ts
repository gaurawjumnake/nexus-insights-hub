/**
 * config/api.ts
 *
 * Single source of truth for the backend API base URL and request URL building.
 *
 * Resolution order for the base URL:
 *   1. localStorage["api_base_url"] (user-configured via sidebar)
 *   2. VITE_API_BASE_URL build-time env
 *   3. http://localhost:8000 fallback
 *
 * All frontend API callers MUST go through buildApiUrl() (or read
 * getApiBaseUrl() at call time) — do NOT cache the value at module scope.
 */

const STORAGE_KEY = 'api_base_url'
// Back-compat: previous key used before the centralisation pass.
const LEGACY_STORAGE_KEY = 'nexus.apiBaseUrl'

const DEFAULT_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as ImportMeta).env?.VITE_API_BASE_URL) ||
  'http://localhost:8000'

export const API_BASE_URL_EVENT = 'nexus:api-base-url-changed'

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

function sanitise(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

export function getApiBaseUrl(): string {
  const storage = safeStorage()
  const stored = storage?.getItem(STORAGE_KEY)
  if (stored && stored.trim()) return sanitise(stored)
  // Migrate legacy key transparently.
  const legacy = storage?.getItem(LEGACY_STORAGE_KEY)
  if (legacy && legacy.trim()) {
    const clean = sanitise(legacy)
    try {
      storage?.setItem(STORAGE_KEY, clean)
      storage?.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    return clean
  }
  return sanitise(DEFAULT_URL)
}

/**
 * Build a fully-qualified API URL from a path.
 * Accepts paths with or without a leading slash.
 *
 *   buildApiUrl('/kpis')          → 'http://localhost:8000/kpis'
 *   buildApiUrl('kpis/calculate') → 'http://localhost:8000/kpis/calculate'
 *   buildApiUrl('https://x/y')    → 'https://x/y'  (absolute passthrough)
 */
export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = getApiBaseUrl()
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}

export function setApiBaseUrl(url: string): void {
  const storage = safeStorage()
  if (!storage) return
  const clean = sanitise(url)
  if (clean) {
    storage.setItem(STORAGE_KEY, clean)
  } else {
    storage.removeItem(STORAGE_KEY)
  }
  // Clear legacy key so it can't shadow future reads.
  try {
    storage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(API_BASE_URL_EVENT, { detail: clean }))
  }
}

export function resetApiBaseUrl(): void {
  const storage = safeStorage()
  storage?.removeItem(STORAGE_KEY)
  storage?.removeItem(LEGACY_STORAGE_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(API_BASE_URL_EVENT, { detail: sanitise(DEFAULT_URL) }),
    )
  }
}

export function getDefaultApiBaseUrl(): string {
  return sanitise(DEFAULT_URL)
}
