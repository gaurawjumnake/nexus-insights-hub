/**
 * config/api.ts
 *
 * Single source of truth for the backend API base URL.
 *
 * Resolution order:
 *   1. localStorage override (user-configured via sidebar)
 *   2. VITE_API_BASE_URL build-time env
 *   3. http://localhost:8000 fallback
 *
 * All frontend API callers MUST read the base URL from getApiBaseUrl()
 * at call time — do NOT cache the value at module scope.
 */

const STORAGE_KEY = 'nexus.apiBaseUrl'
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
  const stored = safeStorage()?.getItem(STORAGE_KEY)
  if (stored && stored.trim()) return sanitise(stored)
  return sanitise(DEFAULT_URL)
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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(API_BASE_URL_EVENT, { detail: clean }))
  }
}

export function resetApiBaseUrl(): void {
  safeStorage()?.removeItem(STORAGE_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(API_BASE_URL_EVENT, { detail: sanitise(DEFAULT_URL) }),
    )
  }
}

export function getDefaultApiBaseUrl(): string {
  return sanitise(DEFAULT_URL)
}
