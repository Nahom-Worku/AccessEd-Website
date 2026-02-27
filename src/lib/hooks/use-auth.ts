'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/lib/api/auth'
import { useAuthStore } from '@/lib/stores/auth-store'
import { setTokens, clearTokens, setStoredUser, getAccessToken } from '@/lib/utils/tokens'
import type { LoginRequest, RegisterRequest } from '@/lib/types/auth'
import { useEffect } from 'react'

export function useUser() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated && !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUsageStatus() {
  const { isAuthenticated, setTier } = useAuthStore()

  const query = useQuery({
    queryKey: ['user', 'usage-status'],
    queryFn: authApi.getUsageStatus,
    enabled: isAuthenticated && !!getAccessToken(),
    staleTime: 60 * 1000,
  })

  // Sync tier to store whenever usage status is fetched
  useEffect(() => {
    if (query.data?.tier) {
      setTier(query.data.tier)
    }
  }, [query.data?.tier, setTier])

  return query
}

export function useLogin() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response) => {
      setTokens(response.access_token, response.refresh_token)
      setStoredUser(response.user as unknown as Record<string, unknown>)
      setUser(response.user)
      // Immediately fetch tier from usage-status
      queryClient.invalidateQueries({ queryKey: ['user'] })
      try {
        const status = await authApi.getUsageStatus()
        useAuthStore.getState().setTier(status.tier)
      } catch { /* tier will be fetched by useUsageStatus hook on next render */ }
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: async (response) => {
      setTokens(response.access_token, response.refresh_token)
      setStoredUser(response.user as unknown as Record<string, unknown>)
      setUser(response.user)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      try {
        const status = await authApi.getUsageStatus()
        useAuthStore.getState().setTier(status.tier)
      } catch { /* tier will be fetched by useUsageStatus hook on next render */ }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearTokens()
      logout()
      queryClient.clear()
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  })
}

export function useSendVerification() {
  return useMutation({
    mutationFn: authApi.sendVerification,
  })
}
