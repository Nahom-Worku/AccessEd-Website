'use client'

import { useRef, useCallback, useEffect } from 'react'
import { Send, Loader2, BookOpen, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useCourses } from '@/lib/hooks/use-courses'
import { useState } from 'react'

export function ChatInput({
  input,
  setInput,
  isStreaming,
  selectedCourseId,
  setSelectedCourseId,
  onSend,
}: {
  input: string
  setInput: (val: string) => void
  isStreaming: boolean
  selectedCourseId: string
  setSelectedCourseId: (id: string) => void
  onSend: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { data: courses } = useCourses()
  const [courseMenuOpen, setCourseMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const selectedCourse = courses?.find((c) => c.id === selectedCourseId)

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 6 * 24) + 'px' // max ~6 lines
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [input, adjustHeight])

  // Close course menu on outside click
  useEffect(() => {
    if (!courseMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCourseMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [courseMenuOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="shrink-0 border-t border-border bg-background">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring transition-shadow">
          {/* Course Selector Pill */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setCourseMenuOpen(!courseMenuOpen)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors',
                selectedCourseId
                  ? 'bg-brand/10 text-brand font-medium'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="max-w-[120px] truncate">{selectedCourse?.name || 'All docs'}</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', courseMenuOpen && 'rotate-180')} />
            </button>

            {courseMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-56 rounded-lg border border-border bg-card shadow-lg py-1 z-20 max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedCourseId('')
                    setCourseMenuOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors',
                    !selectedCourseId && 'bg-secondary font-medium',
                  )}
                >
                  All documents
                </button>
                {courses?.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCourseId(c.id)
                      setCourseMenuOpen(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors truncate',
                      selectedCourseId === c.id && 'bg-secondary font-medium',
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent py-1.5 text-sm outline-none resize-none placeholder:text-muted-foreground min-h-[36px] max-h-[144px]"
          />

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={!input.trim() || isStreaming}
            className={cn(
              'shrink-0 p-2 rounded-lg transition-all',
              input.trim() && !isStreaming
                ? 'bg-brand text-white hover:bg-brand/90'
                : 'text-muted-foreground/40 cursor-not-allowed',
            )}
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground/50 text-center mt-2">
          AI responses may contain inaccuracies. Always verify with your source materials.
        </p>
      </div>
    </div>
  )
}
