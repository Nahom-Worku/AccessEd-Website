'use client'

import { useQuery } from '@tanstack/react-query'
import * as engagementApi from '@/lib/api/engagement'
import { useAuthStore } from '@/lib/stores/auth-store'

export function useStreak() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['engagement', 'streak'],
    queryFn: engagementApi.getStreak,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStreakCalendar(days = 30) {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['engagement', 'streak-calendar', days],
    queryFn: () => engagementApi.getStreakCalendar(days),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useXPStats() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['engagement', 'xp'],
    queryFn: engagementApi.getXPStats,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}
