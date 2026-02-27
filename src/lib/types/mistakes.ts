export interface MistakeQuestion {
  question_hash: string
  question_text: string
  question_type: string
  difficulty: string
  correct_answer: string
  user_answer?: string
  explanation: string
  options?: string[]
  subtopic: string
  parent_topic: string
  course_id: string
  course_name?: string
}

export interface MistakePattern {
  subtopic: string
  subtopic_display_name?: string
  parent_topic: string
  course_id: string
  course_name?: string
  cards_remaining: number
  last_mistake_at?: string
  questions: MistakeQuestion[]
}

export interface MistakeSummary {
  total_patterns: number
  total_cards_remaining: number
  weakest_subtopic?: string
  most_recent_mistake?: string
  courses_with_mistakes: number
}

export interface MistakePatternsResponse {
  patterns: MistakePattern[]
  summary: MistakeSummary
}

export interface PracticeResult {
  question_hash: string
  rating: 'again' | 'hard' | 'good' | 'easy'
}
