import { API_URL } from '@/lib/utils/constants'
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired, getUserIdFromToken } from '@/lib/utils/tokens'

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: Record<string, unknown>,
  ) {
    const msg = (data?.detail as Record<string, unknown>)?.message as string
      || (data?.detail as string)
      || statusText
    super(msg)
    this.name = 'ApiError'
  }

  get isUnauthorized() { return this.status === 401 }
  get isForbidden() { return this.status === 403 }
  get isNotFound() { return this.status === 404 }
  get isPageLimitExceeded() { return this.status === 413 }
  get isRateLimited() { return this.status === 429 }
  get isServerError() { return this.status >= 500 }
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!res.ok) return false

    const data = await res.json()
    setTokens(data.access_token, data.refresh_token)
    return true
  } catch {
    return false
  }
}

async function ensureValidToken(): Promise<boolean> {
  const token = getAccessToken()
  if (!token || !isTokenExpired(token)) return !!token

  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = refreshTokens().finally(() => {
    isRefreshing = false
    refreshPromise = null
  })

  return refreshPromise
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  skipAuth?: boolean
  timeout?: number
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth = false, timeout = 30000, ...init } = options

  if (!skipAuth) {
    const hasToken = await ensureValidToken()
    if (!hasToken && !skipAuth) {
      clearTokens()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new ApiError(401, 'Unauthorized')
    }
  }

  const headers = new Headers(init.headers)

  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
      const userId = getUserIdFromToken(token)
      if (userId) headers.set('X-User-ID', userId)
    }
  }

  if (body && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...init,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (res.status === 401 && !skipAuth) {
      const refreshed = await refreshTokens()
      if (refreshed) {
        return apiClient<T>(endpoint, { ...options, skipAuth: false })
      }
      clearTokens()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new ApiError(401, 'Unauthorized')
    }

    if (!res.ok) {
      let data: Record<string, unknown> | undefined
      try {
        data = await res.json()
      } catch { /* empty */ }
      throw new ApiError(res.status, res.statusText, data)
    }

    if (res.status === 204) return undefined as T

    const contentType = res.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return res.json()
    }

    return res.text() as unknown as T
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'Request Timeout')
    }
    throw error
  }
}

export async function* streamClient(
  endpoint: string,
  body: unknown,
): AsyncGenerator<Record<string, unknown>> {
  await ensureValidToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    const userId = getUserIdFromToken(token)
    if (userId) headers['X-User-ID'] = userId
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let data: Record<string, unknown> | undefined
    try {
      data = await res.json()
    } catch { /* empty */ }
    throw new ApiError(res.status, res.statusText, data)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const dataLine = line.split('\n').find(l => l.startsWith('data: '))
      if (!dataLine) continue
      const jsonStr = dataLine.slice(6)
      if (jsonStr === '[DONE]') return
      try {
        yield JSON.parse(jsonStr)
      } catch { /* skip malformed */ }
    }
  }

  if (buffer.trim()) {
    const dataLine = buffer.split('\n').find(l => l.startsWith('data: '))
    if (dataLine) {
      const jsonStr = dataLine.slice(6)
      if (jsonStr !== '[DONE]') {
        try {
          yield JSON.parse(jsonStr)
        } catch { /* skip */ }
      }
    }
  }
}
