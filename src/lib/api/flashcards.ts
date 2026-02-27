import { apiClient } from './client'
import type { Flashcard, FlashcardCreate, FlashcardRating, FlashcardReviewResult, StudySession, DeckInfo } from '@/lib/types/flashcard'

export async function getFlashcards(params: {
  course_id?: string
  topic?: string
  status?: string
  limit?: number
  offset?: number
} = {}): Promise<Flashcard[]> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, value.toString())
  })
  return apiClient<Flashcard[]>(`/flashcards?${searchParams}`)
}

export async function getFlashcard(cardId: string): Promise<Flashcard> {
  return apiClient<Flashcard>(`/flashcards/${cardId}`)
}

export async function createFlashcard(data: FlashcardCreate): Promise<Flashcard> {
  return apiClient<Flashcard>('/flashcards', {
    method: 'POST',
    body: data,
  })
}

export async function bulkCreateFlashcards(data: FlashcardCreate[]): Promise<Flashcard[]> {
  return apiClient<Flashcard[]>('/flashcards/bulk-create', {
    method: 'POST',
    body: data,
  })
}

export async function updateFlashcard(cardId: string, data: Partial<Flashcard>): Promise<Flashcard> {
  return apiClient<Flashcard>(`/flashcards/${cardId}`, {
    method: 'PATCH',
    body: data,
  })
}

export async function deleteFlashcard(cardId: string): Promise<{ success: boolean }> {
  return apiClient(`/flashcards/${cardId}`, { method: 'DELETE' })
}

export async function getDueCount(courseId?: string): Promise<{ due_count: number }> {
  const params = courseId ? `?course_id=${courseId}` : ''
  return apiClient(`/flashcards/due/count${params}`)
}

export async function getStudySession(params: {
  course_id?: string
  topic?: string
  limit?: number
  include_all?: boolean
} = {}): Promise<StudySession> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, value.toString())
  })
  return apiClient<StudySession>(`/flashcards/study-session?${searchParams}`)
}

export async function reviewFlashcard(data: {
  flashcard_id: string
  rating: FlashcardRating
  time_spent_seconds?: number
}): Promise<FlashcardReviewResult> {
  return apiClient<FlashcardReviewResult>('/flashcards/review', {
    method: 'POST',
    body: data,
  })
}

export async function getDecks(courseId?: string): Promise<DeckInfo[]> {
  const params = courseId ? `?course_id=${courseId}` : ''
  return apiClient<DeckInfo[]>(`/flashcards/decks${params}`)
}
