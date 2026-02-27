export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'short_answer'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface QuizQuestion {
  question_id: string
  question_text: string
  question_type: QuestionType
  difficulty: Difficulty
  correct_answer: string
  explanation: string
  options?: string[]
  acceptable_answers?: string[]
  metadata?: Record<string, unknown>
  subtopic: string
  subtopic_display_name: string
  parent_topic: string
  course_id: string
  hints?: string[]
}

export interface QuizResponse {
  quiz_id: string
  parent_topic: string
  questions: QuizQuestion[]
  total_questions: number
  created_at: string
}

export interface QuizGenerateRequest {
  course_id: string
  parent_topic: string
  difficulty?: Difficulty
  count?: number
  excluded_subtopics?: string[]
}

export interface QuizAnswer {
  question_id: string
  user_answer: string
  time_spent_seconds?: number
}

export interface QuizSubmissionRequest {
  answers: QuizAnswer[]
  completed_at?: string
}

export interface QuizQuestionResult {
  question_id: string
  was_correct: boolean
  user_answer: string
  correct_answer: string
  explanation: string
  points_earned: number
  time_spent: number
}

export interface QuizResultResponse {
  quiz_id: string
  total_questions: number
  correct_count: number
  accuracy: number
  time_spent: number
  results: QuizQuestionResult[]
  proficiency_update?: {
    subtopic: string
    new_proficiency: number
    change: number
  }
  suggested_focus_areas: string[]
  next_difficulty: Difficulty
}
