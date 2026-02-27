import { apiClient } from './client'
import type { MistakePatternsResponse, MistakeSummary, PracticeResult } from '@/lib/types/mistakes'

export async function getMistakePatterns(params: {
  course_id?: string
  parent_topic?: string
  min_mistakes?: number
  limit?: number
  include_questions?: boolean
} = {}): Promise<MistakePatternsResponse> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, value.toString())
  })
  return apiClient<MistakePatternsResponse>(`/mistakes/patterns?${searchParams}`)
}

export async function getMistakeSummary(courseId?: string): Promise<MistakeSummary> {
  const params = courseId ? `?course_id=${courseId}` : ''
  return apiClient<MistakeSummary>(`/mistakes/summary${params}`)
}

export async function generatePracticeQuiz(params: {
  course_id?: string
  subtopic?: string
  limit?: number
} = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, value.toString())
  })
  return apiClient(`/mistakes/practice-quiz?${searchParams}`, { method: 'POST' })
}

export async function recordPracticeResults(results: PracticeResult[]): Promise<{
  success: boolean
  updated_count: number
  removed_count: number
  scheduled_count: number
  message: string
}> {
  return apiClient('/mistakes/record-practice', {
    method: 'POST',
    body: { results },
  })
}

export async function clearMistakes(params: {
  course_id?: string
  subtopic?: string
} = {}): Promise<{ success: boolean; cleared_count: number; message: string }> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, value.toString())
  })
  return apiClient(`/mistakes/clear?${searchParams}`, { method: 'DELETE' })
}
