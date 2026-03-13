'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Sparkles, ArrowDown, Loader2, BookOpen, Brain, HelpCircle, FileQuestion } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { cn } from '@/lib/utils/cn'
import { CitedMarkdown, SourceCards } from './cited-markdown'
import { buildCitationLookup } from '@/lib/hooks/use-chat'
import type { MessageWithCitations, CitationMeta } from '@/lib/stores/chat-store'

// ─── Suggested Prompts ──────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  { icon: BookOpen, label: 'Summarize my lecture notes', color: 'text-blue-500' },
  { icon: Brain, label: 'Explain key concepts from Chapter 3', color: 'text-purple-500' },
  { icon: HelpCircle, label: 'Quiz me on this week\'s material', color: 'text-green-500' },
  { icon: FileQuestion, label: 'What are the main themes in my readings?', color: 'text-amber-500' },
]

function EmptyState({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
        <Sparkles className="h-7 w-7 text-brand" />
      </div>
      <h2 className="text-xl font-semibold mb-1">Ask anything about your documents</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        Get page-verified answers with citations from your course materials.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {SUGGESTED_PROMPTS.map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            onClick={() => onPromptClick(label)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-secondary/80 hover:border-brand/30 transition-all text-left group"
          >
            <Icon className={cn('h-4 w-4 shrink-0', color)} />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Message Bubble ─────────────────────────────────────────────────

function UserBubble({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-brand/10 text-foreground">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </motion.div>
  )
}

function AssistantBubble({
  content,
  citations,
  onCitationClick,
  onSourceClick,
}: {
  content: string
  citations?: CitationMeta
  onCitationClick: (docIdx: string, page: string) => void
  onSourceClick: (docIdx: string) => void
}) {
  const { urlMap } = buildCitationLookup(citations)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="shrink-0 w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center mt-0.5">
        <Sparkles className="h-3.5 w-3.5 text-brand" />
      </div>
      <div className="min-w-0 flex-1">
        <CitedMarkdown content={content} urlMap={urlMap} onCitationClick={onCitationClick} />
        {citations && <SourceCards citations={citations} onSourceClick={onSourceClick} />}
      </div>
    </motion.div>
  )
}

// ─── Streaming Bubble ───────────────────────────────────────────────

function StreamingBubble({ content }: { content: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center mt-0.5">
        <Sparkles className="h-3.5 w-3.5 text-brand" />
      </div>
      <div className="min-w-0 flex-1">
        {content ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
            <span className="inline-block w-0.5 h-4 bg-brand animate-pulse ml-0.5 align-text-bottom" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground py-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

export function ChatMessages({
  messages,
  isStreaming,
  streamingContent,
  onPromptClick,
  onCitationClick,
  onSourceClick,
}: {
  messages: MessageWithCitations[]
  isStreaming: boolean
  streamingContent: string
  onPromptClick: (prompt: string) => void
  onCitationClick: (citations: CitationMeta | undefined, docIdx: string, page: string) => void
  onSourceClick: (citations: CitationMeta | undefined, docIdx: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollFab, setShowScrollFab] = useState(false)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollFab(distFromBottom > 200)
  }, [])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [])

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming) {
      const el = scrollRef.current
      if (!el) return
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (distFromBottom < 300) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      }
    }
  }, [isStreaming, streamingContent])

  const isEmpty = messages.length === 0 && !isStreaming

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {isEmpty && <EmptyState onPromptClick={onPromptClick} />}

          {messages.map((msg, i) => {
            if (msg.role === 'user') {
              return <UserBubble key={i} content={msg.content} />
            }
            return (
              <AssistantBubble
                key={i}
                content={msg.content}
                citations={msg.citations}
                onCitationClick={(docIdx, page) => onCitationClick(msg.citations, docIdx, page)}
                onSourceClick={(docIdx) => onSourceClick(msg.citations, docIdx)}
              />
            )
          })}

          {isStreaming && <StreamingBubble content={streamingContent} />}

          <div id="chat-messages-end" />
        </div>
      </div>

      {/* Scroll FAB */}
      <AnimatePresence>
        {showScrollFab && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-card border border-border shadow-lg hover:bg-secondary transition-colors"
          >
            <ArrowDown className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
