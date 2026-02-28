'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { Send, Loader2, BookOpen, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCourses } from '@/lib/hooks/use-courses'
import { useAuthStore } from '@/lib/stores/auth-store'
import { askDocumentQuestionStream } from '@/lib/api/chat'
import type { ChatMessage } from '@/lib/types/chat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

// Build a lookup: { "1:2" => url, "1:5" => url } from citation metadata
function buildPageUrlMap(citations?: CitationMeta): Record<string, string> {
  if (!citations) return {}
  const map: Record<string, string> = {}
  for (const doc of Object.values(citations.citations_by_document)) {
    const idx = doc.doc_index ?? 1
    const urls = doc.page_view_urls || {}
    for (const page of doc.pages) {
      // Key: "docIndex:page" for multi-doc, or "0:page" for single-doc
      map[`${idx}:${page}`] = urls[String(page)] || ''
      // Also store single-doc key
      if (citations.is_single_document) {
        map[`0:${page}`] = urls[String(page)] || ''
      }
    }
  }
  return map
}

// Replace [1: p. 2] and [p. 2] with clickable links in text
function CitedMarkdown({ content, urlMap }: { content: string; urlMap: Record<string, string> }) {
  // Process the markdown to inject clickable citation links
  const processed = useMemo(() => {
    // Replace [N: p. X] or [N: p. X-Y] or [N: p. X, Y, Z] patterns
    let result = content

    // Multi-doc: [1: p. 2] or [1: p. 2-5] or [1: p. 2, 3]
    result = result.replace(
      /\[(\d+):\s*p\.\s*([\d\s,\-–]+)\]/g,
      (match, docIdx, pages) => {
        const pageNums = pages.split(/[,\s]+/).map((p: string) => p.replace(/[-–].*/, '').trim()).filter(Boolean)
        const firstPage = pageNums[0]
        const url = urlMap[`${docIdx}:${firstPage}`]
        if (url) {
          return `[${match}](${url})`
        }
        return match
      },
    )

    // Single-doc: [p. 2] or [p. 2-5] or [p. 2, 3]
    result = result.replace(
      /\[p\.\s*([\d\s,\-–]+)\]/g,
      (match, pages) => {
        const pageNums = pages.split(/[,\s]+/).map((p: string) => p.replace(/[-–].*/, '').trim()).filter(Boolean)
        const firstPage = pageNums[0]
        // Try single-doc key first, then doc index 1
        const url = urlMap[`0:${firstPage}`] || urlMap[`1:${firstPage}`]
        if (url) {
          return `[${match}](${url})`
        }
        return match
      },
    )

    return result
  }, [content, urlMap])

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-a:font-semibold">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline">
              {children}
            </a>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}

function SourceCards({ citations }: { citations: CitationMeta }) {
  const docs = Object.values(citations.citations_by_document)
  if (docs.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <p className="text-xs font-medium text-muted-foreground mb-2">Sources</p>
      <div className="flex flex-wrap gap-2">
        {docs.map((doc) => {
          const firstPageUrl = doc.page_view_urls?.[String(doc.pages[0])]
          return (
            <a
              key={doc.document_id}
              href={firstPageUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary/80 transition-colors text-xs group"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium truncate max-w-[180px]">{doc.document_name}</span>
              <span className="text-muted-foreground">
                p. {doc.pages.join(', ')}
              </span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user } = useAuthStore()
  const { data: courses } = useCourses()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [messages, setMessages] = useState<MessageWithCitations[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fullContent,
        citations,
      }])
      setStreamingContent('')
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
      setStreamingContent('')
    } finally {
      setIsStreaming(false)
      scrollToBottom()
    }
  }, [input, isStreaming, user, selectedCourseId, messages])

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Course Selector */}
      <div className="border-b border-border px-4 py-2 flex items-center gap-3">
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
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-brand" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Ask anything about your documents</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Get page-verified answers with citations. Select a course above to focus on specific documents.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-foreground/80 text-background dark:bg-white dark:text-slate-900'
                : 'bg-secondary'
            }`}>
              {msg.role === 'assistant' ? (
                <>
                  <CitedMarkdown
                    content={msg.content}
                    urlMap={buildPageUrlMap(msg.citations)}
                  />
                  {msg.citations && <SourceCards citations={msg.citations} />}
                </>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-secondary">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 bg-secondary">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Ask a question about your documents..."
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            disabled={isStreaming}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="rounded-xl"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
