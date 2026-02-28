'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { Send, Loader2, BookOpen, FileText, X, ChevronLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCourses } from '@/lib/hooks/use-courses'
import { useAuthStore } from '@/lib/stores/auth-store'
import { askDocumentQuestionStream } from '@/lib/api/chat'
import type { ChatMessage } from '@/lib/types/chat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { cn } from '@/lib/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────

interface CitationDoc {
  document_id: string
  document_name: string
  pages: number[]
  doc_index: number | null
  page_view_urls?: Record<string, string>
  total_pages?: number
}

interface CitationMeta {
  citations_by_document: Record<string, CitationDoc>
  is_single_document?: boolean
}

interface MessageWithCitations extends ChatMessage {
  citations?: CitationMeta
}

interface PageViewState {
  docName: string
  pages: { pageNum: number; url: string }[]
}

// ─── Helpers ────────────────────────────────────────────────────────

function buildCitationLookup(citations?: CitationMeta) {
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

    // Build page view data keyed by "docIdx" for the panel
    const pagesData = doc.pages.map(p => ({
      pageNum: p,
      url: urls[String(p)] || '',
    })).filter(p => p.url)

    if (pagesData.length > 0) {
      pageViewMap[String(idx)] = { docName: doc.document_name, pages: pagesData }
      // For single-doc responses, citations use docIdx "0" — map that too
      if (citations.is_single_document) {
        pageViewMap['0'] = { docName: doc.document_name, pages: pagesData }
      }
    }
  }

  return { urlMap, pageViewMap }
}

// Parse citation ref like "1:2" or "0:2" from the text pattern
function parseCitationRef(match: string): { docIdx: string; page: string } | null {
  // [1: p. 2] → docIdx=1, page=2
  const multi = match.match(/\[(\d+):\s*p\.\s*(\d+)/)
  if (multi) return { docIdx: multi[1], page: multi[2] }
  // [p. 2] → docIdx=0 (single doc) or 1
  const single = match.match(/\[p\.\s*(\d+)/)
  if (single) return { docIdx: '0', page: single[1] }
  return null
}

// ─── Citation-aware Markdown ────────────────────────────────────────

function CitedMarkdown({
  content,
  urlMap,
  onCitationClick,
}: {
  content: string
  urlMap: Record<string, string>
  onCitationClick: (docIdx: string, page: string) => void
}) {
  // Convert citation patterns to special marker links that we intercept
  const processed = useMemo(() => {
    let result = content

    // Multi-doc: [1: p. 2]
    result = result.replace(
      /\[(\d+):\s*p\.\s*([\d\s,\-–]+)\]/g,
      (match, docIdx, pages) => {
        const firstPage = pages.split(/[,\s]+/)[0]?.replace(/[-–].*/, '').trim()
        if (urlMap[`${docIdx}:${firstPage}`]) {
          return `[${match}](#cite-${docIdx}-${firstPage})`
        }
        return match
      },
    )

    // Single-doc: [p. 2]
    result = result.replace(
      /\[p\.\s*([\d\s,\-–]+)\]/g,
      (match, pages) => {
        const firstPage = pages.split(/[,\s]+/)[0]?.replace(/[-–].*/, '').trim()
        const key = urlMap[`0:${firstPage}`] ? '0' : '1'
        if (urlMap[`${key}:${firstPage}`]) {
          return `[${match}](#cite-${key}-${firstPage})`
        }
        return match
      },
    )

    return result
  }, [content, urlMap])

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children }) => {
            // Intercept citation links
            if (href?.startsWith('#cite-')) {
              const parts = href.replace('#cite-', '').split('-')
              const docIdx = parts[0]
              const page = parts[1]
              return (
                <button
                  onClick={(e) => { e.preventDefault(); onCitationClick(docIdx, page) }}
                  className="text-brand font-semibold hover:underline cursor-pointer"
                >
                  {children}
                </button>
              )
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                {children}
              </a>
            )
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}

// ─── Source Cards ────────────────────────────────────────────────────

function SourceCards({
  citations,
  onSourceClick,
}: {
  citations: CitationMeta
  onSourceClick: (docIdx: string) => void
}) {
  const docs = Object.values(citations.citations_by_document)
  if (docs.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-border/30">
      <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">Sources</p>
      <div className="flex flex-wrap gap-2">
        {docs.map((doc) => (
          <button
            key={doc.document_id}
            onClick={() => onSourceClick(String(doc.doc_index ?? 1))}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/80 transition-colors text-xs group cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-brand" />
            <span className="font-medium truncate max-w-[180px]">{doc.document_name}</span>
            <span className="text-muted-foreground">
              p. {doc.pages.join(', ')}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Fullscreen Lightbox ─────────────────────────────────────────────

function PageLightbox({
  url,
  pageNum,
  onClose,
}: {
  url: string
  pageNum: number
  onClose: () => void
}) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const translateStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 4))
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5))
  const resetZoom = () => { setScale(1); setTranslate({ x: 0, y: 0 }) }

  // Scroll wheel zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setScale(s => Math.min(Math.max(s + delta, 0.5), 4))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Drag to pan when zoomed
  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    translateStart.current = { ...translate }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    setTranslate({
      x: translateStart.current.x + (e.clientX - dragStart.current.x),
      y: translateStart.current.y + (e.clientY - dragStart.current.y),
    })
  }
  const onPointerUp = () => setDragging(false)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-sm font-medium text-white/80">Page {pageNum}</span>
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-white/60 min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={resetZoom} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button onClick={onClose} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={(e) => {
          // Close on backdrop click (not on image)
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`Page ${pageNum}`}
          className="max-h-[calc(100vh-5rem)] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: dragging ? 'none' : 'transform 0.15s ease-out',
          }}
          draggable={false}
        />
      </div>
    </div>
  )
}

// ─── Page Viewer Panel ──────────────────────────────────────────────

function PageViewerPanel({
  data,
  onClose,
  highlightPage,
}: {
  data: PageViewState
  onClose: () => void
  highlightPage?: string
}) {
  const highlightRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<{ url: string; pageNum: number } | null>(null)

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [highlightPage])

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors lg:hidden">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <FileText className="h-4 w-4 text-brand shrink-0" />
        <span className="text-sm font-medium truncate">{data.docName}</span>
        <div className="flex-1" />
        <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Pages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {data.pages.map(({ pageNum, url }) => (
          <div
            key={pageNum}
            ref={highlightPage === String(pageNum) ? highlightRef : undefined}
            className={cn(
              'rounded-lg overflow-hidden border transition-all cursor-pointer group',
              highlightPage === String(pageNum)
                ? 'border-brand shadow-lg shadow-brand/10'
                : 'border-border hover:border-brand/50',
            )}
            onClick={() => setLightbox({ url, pageNum })}
          >
            <div className="bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Page {pageNum}</span>
              <ZoomIn className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Page ${pageNum}`}
              className="w-full"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Fullscreen lightbox */}
      {lightbox && (
        <PageLightbox
          url={lightbox.url}
          pageNum={lightbox.pageNum}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

// ─── Main Chat Page ─────────────────────────────────────────────────

export default function ChatPage() {
  const { user } = useAuthStore()
  const { data: courses } = useCourses()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [messages, setMessages] = useState<MessageWithCitations[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [pageViewer, setPageViewer] = useState<{ data: PageViewState; highlightPage?: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Keep a ref of the latest message citations for opening the panel
  const latestCitationsRef = useRef<{ pageViewMap: Record<string, PageViewState> }>({ pageViewMap: {} })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const openPageViewer = useCallback((msgCitations: CitationMeta | undefined, docIdx: string, highlightPage?: string) => {
    if (!msgCitations) return
    const { pageViewMap } = buildCitationLookup(msgCitations)
    const data = pageViewMap[docIdx]
    if (data) {
      setPageViewer({ data, highlightPage })
    }
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming || !user) return

    const userMessage: MessageWithCitations = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')

    try {
      let fullContent = ''
      let citations: CitationMeta | undefined
      const stream = askDocumentQuestionStream({
        question: userMessage.content,
        user_id: user.id,
        course_id: selectedCourseId || undefined,
        history: messages,
      })

      for await (const event of stream) {
        const e = event as unknown as Record<string, unknown>
        if (e.type === 'content' && e.content) {
          fullContent += e.content as string
          setStreamingContent(fullContent)
          scrollToBottom()
        } else if (e.type === 'metadata') {
          citations = {
            citations_by_document: (e.citations_by_document || {}) as Record<string, CitationDoc>,
            is_single_document: e.is_single_document as boolean | undefined,
          }
        } else if (e.type === 'error') {
          fullContent = (e.message as string) || 'An error occurred'
        }
      }

      const newMsg: MessageWithCitations = { role: 'assistant', content: fullContent, citations }
      setMessages(prev => [...prev, newMsg])
      setStreamingContent('')
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
      setStreamingContent('')
    } finally {
      setIsStreaming(false)
      scrollToBottom()
    }
  }, [input, isStreaming, user, selectedCourseId, messages])

  const panelOpen = !!pageViewer

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Chat Column */}
      <div className={cn('flex-1 flex flex-col min-w-0 transition-all', panelOpen && 'lg:mr-0')}>
        {/* Course Selector */}
        <div className="border-b border-border px-4 py-2 flex items-center gap-3 shrink-0">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-sm bg-transparent border-none outline-none text-foreground"
          >
            <option value="">All documents</option>
            {courses?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
                  <Send className="h-7 w-7 text-brand" />
                </div>
                <h2 className="text-lg font-semibold mb-1">Ask anything about your documents</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Get page-verified answers with citations. Select a course above to focus on specific documents.
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-foreground/80 text-background dark:bg-white dark:text-slate-900">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                )
              }

              // Assistant message — no bubble, just clean content
              const { urlMap } = buildCitationLookup(msg.citations)
              return (
                <div key={i} className="space-y-0">
                  <CitedMarkdown
                    content={msg.content}
                    urlMap={urlMap}
                    onCitationClick={(docIdx, page) => openPageViewer(msg.citations, docIdx, page)}
                  />
                  {msg.citations && (
                    <SourceCards
                      citations={msg.citations}
                      onSourceClick={(docIdx) => openPageViewer(msg.citations, docIdx)}
                    />
                  )}
                </div>
              )
            })}

            {isStreaming && streamingContent && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{streamingContent}</ReactMarkdown>
              </div>
            )}

            {isStreaming && !streamingContent && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border bg-background">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-1 focus-within:ring-2 focus-within:ring-ring transition-shadow">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Ask a question about your documents..."
                className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                disabled={isStreaming}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="shrink-0 h-8 w-8 rounded-lg"
              >
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Viewer Panel */}
      {panelOpen && (
        <>
          {/* Mobile overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setPageViewer(null)}
          />
          <div className={cn(
            'fixed right-0 top-0 bottom-0 z-50 w-[85vw] max-w-md',
            'lg:relative lg:z-auto lg:w-[420px] lg:max-w-none lg:shrink-0',
          )}>
            <PageViewerPanel
              data={pageViewer.data}
              onClose={() => setPageViewer(null)}
              highlightPage={pageViewer.highlightPage}
            />
          </div>
        </>
      )}
    </div>
  )
}
