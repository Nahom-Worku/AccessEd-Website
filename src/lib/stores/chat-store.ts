import { create } from 'zustand'

// ─── Types ──────────────────────────────────────────────────────────

export interface CitationDoc {
  document_id: string
  document_name: string
  pages: number[]
  doc_index: number | null
  page_view_urls?: Record<string, string>
  total_pages?: number
}

export interface CitationMeta {
  citations_by_document: Record<string, CitationDoc>
  is_single_document?: boolean
}

export interface MessageWithCitations {
  role: 'user' | 'assistant' | 'system'
  content: string
  citations?: CitationMeta
}

export interface PageViewState {
  docName: string
  pages: { pageNum: number; url: string }[]
}

// ─── Store ──────────────────────────────────────────────────────────

interface ChatState {
  // Session
  activeSessionId: string | null
  setActiveSessionId: (id: string | null) => void

  // Messages
  messages: MessageWithCitations[]
  setMessages: (msgs: MessageWithCitations[]) => void
  addMessage: (msg: MessageWithCitations) => void

  // Input
  input: string
  setInput: (val: string) => void

  // Streaming
  isStreaming: boolean
  setIsStreaming: (val: boolean) => void
  streamingContent: string
  setStreamingContent: (val: string) => void

  // Course
  selectedCourseId: string
  setSelectedCourseId: (id: string) => void

  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  sessionSearch: string
  setSessionSearch: (val: string) => void

  // Page viewer
  pageViewer: { data: PageViewState; highlightPage?: string } | null
  setPageViewer: (viewer: { data: PageViewState; highlightPage?: string } | null) => void

  // Reset for new chat
  resetChat: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeSessionId: null,
  setActiveSessionId: (id) => set({ activeSessionId: id }),

  messages: [],
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  input: '',
  setInput: (val) => set({ input: val }),

  isStreaming: false,
  setIsStreaming: (val) => set({ isStreaming: val }),
  streamingContent: '',
  setStreamingContent: (val) => set({ streamingContent: val }),

  selectedCourseId: '',
  setSelectedCourseId: (id) => set({ selectedCourseId: id }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  sessionSearch: '',
  setSessionSearch: (val) => set({ sessionSearch: val }),

  pageViewer: null,
  setPageViewer: (viewer) => set({ pageViewer: viewer }),

  resetChat: () =>
    set({
      activeSessionId: null,
      messages: [],
      input: '',
      streamingContent: '',
      isStreaming: false,
      selectedCourseId: '',
      pageViewer: null,
    }),
}))
