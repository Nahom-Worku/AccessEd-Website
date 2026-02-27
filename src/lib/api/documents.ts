import { apiClient } from './client'
import type { UploadResponse, UploadStatus, DocumentListResponse, Document, PageView } from '@/lib/types/document'

export async function uploadDocument(file: File, userId: string, courseId?: string): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)
  if (courseId) formData.append('course_id', courseId)

  return apiClient<UploadResponse>('/documents/upload', {
    method: 'POST',
    body: formData,
    timeout: 300000,
  })
}

export async function getUploadStatus(documentId: string): Promise<UploadStatus> {
  return apiClient<UploadStatus>(`/documents/upload-status/${documentId}`)
}

export async function getDocuments(params: {
  course_id?: string
  status?: string
  limit?: number
  offset?: number
} = {}): Promise<DocumentListResponse> {
  const searchParams = new URLSearchParams()
  if (params.course_id) searchParams.set('course_id', params.course_id)
  if (params.status) searchParams.set('status', params.status)
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.offset) searchParams.set('offset', params.offset.toString())

  return apiClient<DocumentListResponse>(`/documents?${searchParams}`)
}

export async function getDocument(documentId: string): Promise<Document> {
  return apiClient<Document>(`/documents/${documentId}`)
}

export async function getDocumentText(documentId: string): Promise<{ id: string; text: string; page_count: number; filename: string }> {
  return apiClient(`/documents/${documentId}/text`)
}

export async function viewDocumentPage(documentId: string, pageNumber: number, searchText?: string): Promise<PageView> {
  return apiClient<PageView>(`/documents/${documentId}/page/${pageNumber}/view-highlighted`, {
    method: 'POST',
    body: { search_text: searchText },
  })
}

export async function updateDocument(documentId: string, data: { course_id?: string; filename?: string }): Promise<Document> {
  return apiClient<Document>(`/documents/${documentId}`, {
    method: 'PATCH',
    body: data,
  })
}

export async function deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
  return apiClient(`/documents/${documentId}`, { method: 'DELETE' })
}
