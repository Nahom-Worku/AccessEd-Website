export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AskQuestionRequest {
  course_id: string
  question_context: QuestionContext
  mode?: 'explain' | 'examples' | 'deep_dive' | 'open'
  user_question?: string
}

export interface QuestionContext {
  question_id: string
  question_text: string
  user_answer: string
  correct_answer: string
  subtopic: string
  subtopic_display_name: string
  difficulty: string
  base_explanation: string
  options?: string[]
  quick_insight?: string
  correct_concept?: string[]
  doc_quote?: string
  doc_reference?: string
  document_ids?: string[]
  source_pages?: number[]
}

export interface ContinueChatRequest {
  course_id: string
  question_context: QuestionContext
  history: ChatMessage[]
  user_message: string
}

export interface ChatResponse {
  session_id: string
  response: string
  suggested_actions: string[]
  citations?: CitationsByDocument
}

export interface CitationsByDocument {
  [documentId: string]: {
    document_name: string
    page_references: number[]
    relevant_excerpts: string[]
  }
}

export interface DocumentAskRequest {
  question: string
  user_id: string
  course_id?: string
  document_id?: string
  history?: ChatMessage[]
}

export type StreamEventType = 'start' | 'chunk' | 'citation' | 'complete' | 'error'

export interface StreamEvent {
  type: StreamEventType
  session_id?: string
  message?: string
  text?: string
  document_id?: string
  page?: number
  excerpt?: string
  full_response?: string
}
