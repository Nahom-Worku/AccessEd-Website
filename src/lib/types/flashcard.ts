export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy'

export interface Flashcard {
  id: string
  front: string
  back: string
  hint?: string
  course_id?: string
  topic?: string
  subtopic?: string
  subtopic_display_name?: string
  tags: string[]
  source_type?: string
  source_question_id?: string
  source_quiz_id?: string
  status: 'active' | 'archived' | 'deleted'
  created_at: string
  updated_at: string
  ease_factor: number
  interval_days: number
  repetitions: number
  next_review_at?: string
  total_reviews: number
  correct_reviews: number
}

export interface FlashcardCreate {
  front: string
  back: string
  hint?: string
  course_id?: string
  topic?: string
  subtopic?: string
  subtopic_display_name?: string
  tags?: string[]
  source_type?: string
  source_question_id?: string
  source_quiz_id?: string
}

export interface StudySession {
  session_id: string
  deck_name: string
  total_cards: number
  due_cards: number
  cards: Flashcard[]
}

export interface FlashcardReviewResult {
  flashcard_id: string
  rating: string
  next_review_at: string
  ease_factor: number
  interval_days: number
  mastered: boolean
}

export interface DeckInfo {
  id: string
  name: string
  description?: string
  deck_type: string
  card_count: number
  due_count: number
  course_id?: string
}
