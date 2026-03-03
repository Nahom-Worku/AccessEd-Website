import { apiClient, streamClient } from './client'
import type {
  AskQuestionRequest, ContinueChatRequest, ChatResponse, DocumentAskRequest, StreamEvent,
  ChatSession, ChatSessionDetail, CreateSessionRequest, AddMessagesRequest,
} from '@/lib/types/chat'

export async function askAboutQuestion(data: AskQuestionRequest): Promise<ChatResponse> {
  return apiClient<ChatResponse>('/ai/ask-about-question', {
    method: 'POST',
    body: data,
    timeout: 60000,
  })
}

export async function continueChat(data: ContinueChatRequest): Promise<ChatResponse> {
  return apiClient<ChatResponse>('/ai/continue-chat', {
    method: 'POST',
    body: data,
    timeout: 60000,
  })
}

export async function* askAboutQuestionStream(data: AskQuestionRequest): AsyncGenerator<StreamEvent> {
  for await (const event of streamClient('/ai/ask-about-question/stream', data)) {
    yield event as unknown as StreamEvent
  }
}

export async function* continueChatStream(data: ContinueChatRequest): AsyncGenerator<StreamEvent> {
  for await (const event of streamClient('/ai/continue-chat/stream', data)) {
    yield event as unknown as StreamEvent
  }
}

export async function askDocumentQuestion(data: DocumentAskRequest): Promise<{
  answer: string
  citations_by_document: Record<string, { document_name: string; page_references: number[]; relevant_excerpts: string[] }>
  confidence: number
}> {
  return apiClient('/documents/ask', {
    method: 'POST',
    body: data,
    timeout: 60000,
  })
}

export async function* askDocumentQuestionStream(data: DocumentAskRequest): AsyncGenerator<StreamEvent> {
  for await (const event of streamClient('/documents/ask-stream', data)) {
    yield event as unknown as StreamEvent
  }
}

// ─── Chat Sessions ──────────────────────────────────────────────────

export async function getChatSessions(params: {
  course_id?: string
  limit?: number
  offset?: number
} = {}): Promise<ChatSession[]> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, value.toString())
  })
  return apiClient<ChatSession[]>(`/chat/sessions?${searchParams}`)
}

export async function getChatSession(sessionId: string): Promise<ChatSessionDetail> {
  return apiClient<ChatSessionDetail>(`/chat/sessions/${sessionId}`)
}

export async function createChatSession(data: CreateSessionRequest): Promise<ChatSession> {
  return apiClient<ChatSession>('/chat/sessions', {
    method: 'POST',
    body: data,
  })
}

export async function updateChatSession(sessionId: string, title: string): Promise<ChatSession> {
  return apiClient<ChatSession>(`/chat/sessions/${sessionId}`, {
    method: 'PATCH',
    body: { title },
  })
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  return apiClient(`/chat/sessions/${sessionId}`, { method: 'DELETE' })
}

export async function addSessionMessages(sessionId: string, data: AddMessagesRequest): Promise<void> {
  return apiClient(`/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: data,
  })
}
