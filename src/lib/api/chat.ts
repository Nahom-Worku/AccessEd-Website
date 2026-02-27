import { apiClient, streamClient } from './client'
import type { AskQuestionRequest, ContinueChatRequest, ChatResponse, DocumentAskRequest, StreamEvent } from '@/lib/types/chat'

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
