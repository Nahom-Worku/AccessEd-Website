import { apiClient } from './client'
import type { QuizGenerateRequest, QuizResponse, QuizSubmissionRequest, QuizResultResponse } from '@/lib/types/quiz'

export async function generateQuiz(data: QuizGenerateRequest): Promise<QuizResponse> {
  return apiClient<QuizResponse>('/quizzes/generate', {
    method: 'POST',
    body: data,
    timeout: 60000,
  })
}

export async function submitQuiz(quizId: string, data: QuizSubmissionRequest): Promise<QuizResultResponse> {
  return apiClient<QuizResultResponse>(`/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: data,
  })
}

export async function getQuizStatus(quizId: string): Promise<{
  quiz_id: string
  status: string
  progress: number
  questions_answered: number
  total_questions: number
}> {
  return apiClient(`/quizzes/${quizId}/status`)
}
