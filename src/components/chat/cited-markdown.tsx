'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { FileText } from 'lucide-react'
import type { CitationMeta } from '@/lib/stores/chat-store'

// ─── Citation-aware Markdown ────────────────────────────────────────

export function CitedMarkdown({
  content,
  urlMap,
  onCitationClick,
}: {
  content: string
  urlMap: Record<string, string>
  onCitationClick: (docIdx: string, page: string) => void
}) {
  const processed = useMemo(() => {
    let result = content
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
            if (href?.startsWith('#cite-')) {
              const parts = href.replace('#cite-', '').split('-')
              const docIdx = parts[0]
              const page = parts[1]
              return (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onCitationClick(docIdx, page)
                  }}
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

export function SourceCards({
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
            <span className="text-muted-foreground">p. {doc.pages.join(', ')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
