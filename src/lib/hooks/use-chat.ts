'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/stores/auth-store'
import {
  useChatStore,
  type CitationDoc,
  type CitationMeta,
  type MessageWithCitations,
  type PageViewState,
} from '@/lib/stores/chat-store'
import {
  askDocumentQuestionStream,
  getChatSessions,
  getChatSession,
  createChatSession,
  updateChatSession,
  deleteChatSession,
  addSessionMessages,
} from '@/lib/api/chat'
import { toast } from 'sonner'

// ─── Helpers ────────────────────────────────────────────────────────

export function buildCitationLookup(citations?: CitationMeta) {
  if (!citations) return { urlMap: {} as Record<string, string>, pageViewMap: {} as Record<string, PageViewState> }

  const urlMap: Record<string, string> = {}
  const pageViewMap: Record<string, PageViewState> = {}

  for (const doc of Object.values(citations.citations_by_document)) {
    const idx = doc.doc_index ?? 1
    const urls = doc.page_view_urls || {}

    for (const page of doc.pages) {
      urlMap[`${idx}:${page}`] = urls[String(page)] || ''
      if (citations.is_single_document) {
        urlMap[`0:${page}`] = urls[String(page)] || ''
      }
    }

    const pagesData = doc.pages
      .map((p) => ({ pageNum: p, url: urls[String(p)] || '' }))
      .filter((p) => p.url)

    if (pagesData.length > 0) {
      pageViewMap[String(idx)] = { docName: doc.document_name, pages: pagesData }
      if (citations.is_single_document) {
        pageViewMap['0'] = { docName: doc.document_name, pages: pagesData }
      }
    }
  }

  return { urlMap, pageViewMap }
}

// ─── Sessions Query ─────────────────────────────────────────────────

export function useChatSessions() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => getChatSessions({ limit: 50 }),
    enabled: !!user,
    staleTime: 30 * 1000,
  })
}

// ─── Core Hook ──────────────────────────────────────────────────────

export function useChat() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const {
    activeSessionId,
    setActiveSessionId,
    messages,
    setMessages,
    addMessage,
    input,
    setInput,
    isStreaming,
    setIsStreaming,
    streamingContent,
    setStreamingContent,
    selectedCourseId,
    setSelectedCourseId,
    pageViewer,
    setPageViewer,
    resetChat,
  } = useChatStore()

  const scrollToBottom = useCallback(() => {
    // Defer to allow DOM update
    requestAnimationFrame(() => {
      const el = document.getElementById('chat-messages-end')
      el?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  const loadSession = useCallback(
    async (sessionId: string) => {
      try {
        const detail = await getChatSession(sessionId)
        const loaded: MessageWithCitations[] = detail.messages.map((m) => ({
          role: m.role,
          content: m.content,
          citations: m.metadata?.citations as CitationMeta | undefined,
        }))
        setMessages(loaded)
        setActiveSessionId(sessionId)
        setSelectedCourseId(detail.course_id || '')
        setTimeout(scrollToBottom, 100)
      } catch {
        toast.error('Failed to load conversation')
      }
    },
    [setMessages, setActiveSessionId, setSelectedCourseId, scrollToBottom],
  )

  const handleNewChat = useCallback(() => {
    resetChat()
  }, [resetChat])

  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        await deleteChatSession(id)
        queryClient.setQueryData<ReturnType<typeof getChatSessions> extends Promise<infer T> ? T : never>(
          ['chat-sessions'],
          (old) => (old ? old.filter((s) => s.id !== id) : []),
        )
        if (activeSessionId === id) resetChat()
        toast.success('Conversation deleted')
      } catch {
        toast.error('Failed to delete')
      }
    },
    [activeSessionId, resetChat, queryClient],
  )

  const handleRenameSession = useCallback(
    async (id: string, title: string) => {
      try {
        await updateChatSession(id, title)
        queryClient.setQueryData<ReturnType<typeof getChatSessions> extends Promise<infer T> ? T : never>(
          ['chat-sessions'],
          (old) => (old ? old.map((s) => (s.id === id ? { ...s, title } : s)) : []),
        )
      } catch {
        toast.error('Failed to rename')
      }
    },
    [queryClient],
  )

  const openPageViewer = useCallback(
    (msgCitations: CitationMeta | undefined, docIdx: string, highlightPage?: string) => {
      if (!msgCitations) return
      const { pageViewMap } = buildCitationLookup(msgCitations)
      const data = pageViewMap[docIdx]
      if (data) setPageViewer({ data, highlightPage })
    },
    [setPageViewer],
  )

  const handleSend = useCallback(
    async (overrideInput?: string) => {
      const text = (overrideInput ?? input).trim()
      if (!text || isStreaming || !user) return

      const userMessage: MessageWithCitations = { role: 'user', content: text }
      const currentMessages = [...messages, userMessage]
      setMessages(currentMessages)
      setInput('')
      setIsStreaming(true)
      setStreamingContent('')

      try {
        let fullContent = ''
        let citations: CitationMeta | undefined
        let currentSessionId = activeSessionId

        // Create session if first message
        if (!currentSessionId) {
          try {
            const session = await createChatSession({
              title: text.slice(0, 100),
              course_id: selectedCourseId || undefined,
            })
            currentSessionId = session.id
            setActiveSessionId(session.id)
            queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
          } catch {
            // Continue without session persistence
          }
        }

        const stream = askDocumentQuestionStream({
          question: text,
          user_id: user.id,
          course_id: selectedCourseId || undefined,
          history: messages,
          session_id: currentSessionId || undefined,
        })

        for await (const event of stream) {
          const e = event as unknown as Record<string, unknown>
          if (e.type === 'content' && e.content) {
            fullContent += e.content as string
            setStreamingContent(fullContent)
          } else if (e.type === 'metadata') {
            citations = {
              citations_by_document: (e.citations_by_document || {}) as Record<string, CitationDoc>,
              is_single_document: e.is_single_document as boolean | undefined,
            }
          } else if (e.type === 'error') {
            fullContent = (e.message as string) || 'An error occurred'
          }
        }

        // Finalize: stop streaming BEFORE adding the final message
        // to avoid a flash of "Thinking..." alongside the completed response
        setIsStreaming(false)
        setStreamingContent('')
        const assistantMsg: MessageWithCitations = { role: 'assistant', content: fullContent, citations }
        addMessage(assistantMsg)
        scrollToBottom()

        // Persist messages (fire-and-forget, don't block UI)
        if (currentSessionId) {
          addSessionMessages(currentSessionId, {
            messages: [
              { role: 'user', content: text },
              { role: 'assistant', content: fullContent, metadata: citations ? { citations } : undefined },
            ],
          })
            .then(() => queryClient.invalidateQueries({ queryKey: ['chat-sessions'] }))
            .catch(() => {})
        }
      } catch {
        setIsStreaming(false)
        setStreamingContent('')
        addMessage({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' })
      }
    },
    [
      input, isStreaming, user, selectedCourseId, messages, activeSessionId,
      setMessages, setInput, setIsStreaming, setStreamingContent, addMessage,
      setActiveSessionId, scrollToBottom, queryClient,
    ],
  )

  return {
    // State
    messages,
    input,
    setInput,
    isStreaming,
    streamingContent,
    selectedCourseId,
    setSelectedCourseId,
    activeSessionId,
    pageViewer,
    setPageViewer,

    // Actions
    handleSend,
    handleNewChat,
    loadSession,
    handleDeleteSession,
    handleRenameSession,
    openPageViewer,
    scrollToBottom,
  }
}
