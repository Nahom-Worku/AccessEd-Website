'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FileText, MessageSquare, ClipboardCheck, BookOpen, Trash2, Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { DocumentUpload } from '@/components/courses/document-upload'
import { useCourse } from '@/lib/hooks/use-courses'
import { useDocuments, useDeleteDocument } from '@/lib/hooks/use-documents'
import { formatDate, formatFileSize } from '@/lib/utils/format'
import { toast } from 'sonner'

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const { data: course, isLoading: courseLoading } = useCourse(courseId)
  const { data: docsData, isLoading: docsLoading, refetch: refetchDocs } = useDocuments(courseId)
  const deleteDoc = useDeleteDocument()

  const color = course?.color || '#2563EB'
  const documents = docsData?.documents || []

  if (courseLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <BookOpen className="h-5 w-5" style={{ color }} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{course?.name}</h1>
            <p className="text-xs text-muted-foreground">{documents.length} documents</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href={`/courses/${courseId}/quiz`}>
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col items-center gap-1">
            <ClipboardCheck className="h-5 w-5" style={{ color }} />
            <span className="text-xs">Quiz</span>
          </Button>
        </Link>
        <Link href={`/courses/${courseId}/flashcards`}>
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col items-center gap-1">
            <BookOpen className="h-5 w-5" style={{ color }} />
            <span className="text-xs">Flashcards</span>
          </Button>
        </Link>
        <Link href="/chat">
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col items-center gap-1">
            <MessageSquare className="h-5 w-5" style={{ color }} />
            <span className="text-xs">AI Chat</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4 mt-4">
          <DocumentUpload
            courseId={courseId}
            courseColor={color}
            onUploadComplete={() => refetchDocs()}
          />

          {docsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/courses/${courseId}/documents/${doc.id}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {doc.filename}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {doc.page_count} pages &middot; {formatFileSize(doc.file_size)} &middot; {formatDate(doc.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'processing' && (
                        <span className="text-xs text-brand animate-pulse-soft">Processing...</span>
                      )}
                      {doc.status === 'error' && (
                        <span className="text-xs text-destructive">Error</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Delete "${doc.filename}"?`)) {
                            deleteDoc.mutate(doc.id, {
                              onSuccess: () => { toast.success('Document deleted'); refetchDocs() },
                            })
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Upload}
              title="No documents yet"
              description="Upload your first PDF to start studying with AI."
            />
          )}
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p className="text-sm">Course analytics and topic mastery overview will appear here as you study.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
