'use client'

import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getAccessToken, isTokenExpired, getRefreshToken } from '@/lib/utils/tokens'
import { refreshToken as refreshTokenApi, getUsageStatus } from '@/lib/api/auth'
import { setTokens } from '@/lib/utils/tokens'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setTier, logout, isAuthenticated } = useAuthStore()

  useEffect(() => {
    async function checkAuth() {
      const token = getAccessToken()
      if (!token) return

      if (isTokenExpired(token)) {
        const refresh = getRefreshToken()
        if (!refresh) {
          logout()
          return
        }

        try {
          const response = await refreshTokenApi(refresh)
          setTokens(response.access_token, response.refresh_token)
          setUser(response.user)
        } catch {
          logout()
          return
        }
      }

      // Always fetch tier from backend to stay in sync
      try {
        const status = await getUsageStatus()
        setTier(status.tier)
      } catch {
        // Non-fatal — tier will be fetched by useUsageStatus hook
      }
    }

    if (isAuthenticated) {
      checkAuth()
    }
  }, [isAuthenticated, setUser, setTier, logout])

  return <>{children}</>
}
