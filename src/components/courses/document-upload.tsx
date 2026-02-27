'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useUploadDocument, useUploadStatus } from '@/lib/hooks/use-documents'
import { useAuthStore } from '@/lib/stores/auth-store'
import { formatFileSize } from '@/lib/utils/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

interface DocumentUploadProps {
  courseId: string
  courseColor?: string
  onUploadComplete?: () => void
}

export function DocumentUpload({ courseId, courseColor, onUploadComplete }: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { user } = useAuthStore()
  const upload = useUploadDocument()
  const { data: uploadStatus } = useUploadStatus(uploadingDocId)

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are supported')
        return
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File must be under 100MB')
        return
      }
      setSelectedFile(file)
      upload.mutate(
        { file, userId: user!.id, courseId },
        {
          onSuccess: (response) => {
            setUploadingDocId(response.document_id)
          },
          onError: (error) => {
            toast.error(error.message || 'Upload failed')
            setSelectedFile(null)
          },
        },
      )
    },
    [courseId, upload, user],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const isComplete = uploadStatus?.status === 'ready'
  const isError = uploadStatus?.status === 'error'

  if (isComplete) {
    setTimeout(() => {
      setUploadingDocId(null)
      setSelectedFile(null)
      onUploadComplete?.()
    }, 1500)
  }

  if (selectedFile && uploadingDocId) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
          </div>
          {isComplete && <CheckCircle className="h-5 w-5 text-green-500" />}
          {isError && <AlertCircle className="h-5 w-5 text-destructive" />}
          {!isComplete && !isError && <Loader2 className="h-5 w-5 animate-spin text-brand" />}
        </div>
        <Progress value={uploadStatus?.progress || 0} />
        <p className="text-xs text-muted-foreground mt-2">
          {uploadStatus?.status_message || 'Uploading...'}
        </p>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
        dragOver ? 'border-brand bg-brand/5' : 'border-border hover:border-muted-foreground/30',
      )}
      onClick={() => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.pdf'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) handleFile(file)
        }
        input.click()
      }}
    >
      <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
      <p className="text-sm font-medium mb-1">Drop a PDF here or click to browse</p>
      <p className="text-xs text-muted-foreground">Maximum 100MB per file</p>
      {courseColor && (
        <Button
          variant="outline"
          className="mt-4"
          style={{ borderColor: `${courseColor}40`, color: courseColor }}
        >
          Upload document
        </Button>
      )}
    </div>
  )
}
