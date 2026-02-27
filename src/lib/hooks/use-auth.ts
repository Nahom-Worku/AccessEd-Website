'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/lib/api/auth'
import { useAuthStore } from '@/lib/stores/auth-store'
import { setTokens, clearTokens, setStoredUser, getAccessToken } from '@/lib/utils/tokens'
import type { LoginRequest, RegisterRequest } from '@/lib/types/auth'

export function useUser() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated && !!getAccessToken(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setTokens(response.access_token, response.refresh_token)
      setStoredUser(response.user as unknown as Record<string, unknown>)
      setUser(response.user)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setTokens(response.access_token, response.refresh_token)
      setStoredUser(response.user as unknown as Record<string, unknown>)
      setUser(response.user)
      queryClient.invalidateQueries({ queryKey: ['user'] })
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

export function useUsageLimits() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['user', 'usage-limits'],
    queryFn: authApi.getUsageLimits,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  })
}
