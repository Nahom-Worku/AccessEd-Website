export interface Document {
  id: string
  user_id: string
  filename: string
  file_size: number
  page_count: number
  status: DocumentStatus
  course_id?: string
  created_at: string
  updated_at: string
}

export type DocumentStatus = 'queued' | 'processing' | 'ready' | 'error'

export interface UploadResponse {
  status: string
  message: string
  document_id: string
  filename: string
  queue_position: number
  is_priority: boolean
}

export interface UploadStatus {
  status: DocumentStatus
  progress: number
  status_message: string
  position?: number
  document_id: string
  filename: string
  file_size: number
  user_id: string
  page_count?: number
  queued_at?: string
  started_at?: string
  completed_at?: string
  error?: string
}

export interface DocumentListResponse {
  documents: Document[]
  total: number
}

export interface PageView {
  page_number: number
  text: string
  image_url?: string
  highlighted_sections?: HighlightedSection[]
}

export interface HighlightedSection {
  text: string
  position: number
  relevance: number
}
