import { decodeJwt } from 'jose'
import { TOKEN_KEYS } from './constants'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEYS.accessToken)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEYS.refreshToken)
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEYS.accessToken, accessToken)
  localStorage.setItem(TOKEN_KEYS.refreshToken, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.accessToken)
  localStorage.removeItem(TOKEN_KEYS.refreshToken)
  localStorage.removeItem(TOKEN_KEYS.user)
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(TOKEN_KEYS.user)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStoredUser(user: Record<string, unknown>) {
  localStorage.setItem(TOKEN_KEYS.user, JSON.stringify(user))
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwt(token)
    if (!payload.exp) return true
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch {
    return true
  }
}

export function isTokenExpiringSoon(token: string, bufferSeconds = 300): boolean {
  try {
    const payload = decodeJwt(token)
    if (!payload.exp) return true
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now + bufferSeconds
  } catch {
    return true
  }
}

export function getUserIdFromToken(token: string): string | null {
  try {
    const payload = decodeJwt(token)
    return (payload.sub as string) || null
  } catch {
    return null
  }
}
