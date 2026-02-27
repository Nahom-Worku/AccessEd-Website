import { apiClient } from './client'
import type {
  StreakResponse,
  StreakCalendarResponse,
  RecordActivityRequest,
  RecordActivityResponse,
  XPStats,
} from '@/lib/types/engagement'

export async function getStreak(): Promise<StreakResponse> {
  return apiClient<StreakResponse>('/engagement/streak')
}

export async function getStreakCalendar(days = 30): Promise<StreakCalendarResponse> {
  return apiClient<StreakCalendarResponse>(`/engagement/streak/calendar?days=${days}`)
}

export async function recordActivity(data: RecordActivityRequest): Promise<RecordActivityResponse> {
  return apiClient<RecordActivityResponse>('/engagement/streak/activity', {
    method: 'POST',
    body: data,
  })
}

export async function useStreakShield(): Promise<{ success: boolean; shields_remaining: number; message: string }> {
  return apiClient('/engagement/streak/use-shield', { method: 'POST' })
}

export async function getXPStats(): Promise<XPStats> {
  return apiClient<XPStats>('/engagement/xp')
}
