'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useDocument } from '@/lib/hooks/use-documents'
import { viewDocumentPage } from '@/lib/api/documents'
import { useQuery } from '@tanstack/react-query'

export default function DocumentViewerPage({ params }: { params: Promise<{ courseId: string; documentId: string }> }) {
  const { courseId, documentId } = use(params)
  const { data: doc } = useDocument(documentId)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: pageData, isLoading: pageLoading } = useQuery({
    queryKey: ['documents', 'page', documentId, currentPage],
    queryFn: () => viewDocumentPage(documentId, currentPage),
    enabled: !!documentId,
  })

  const totalPages = doc?.page_count || 1

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
      <div className="border-b border-border px-4 py-2 flex items-center gap-3">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <span className="text-sm font-medium truncate flex-1">{doc?.filename}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-14 h-8 text-center text-sm"
            />
            <span className="text-muted-foreground">/ {totalPages}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        {pageLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6 lg:p-8">
              {pageData?.image_url ? (
                <img src={pageData.image_url} alt={`Page ${currentPage}`} className="w-full" />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                  {pageData?.text || 'No content available for this page.'}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
