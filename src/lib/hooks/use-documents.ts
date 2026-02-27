'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as docsApi from '@/lib/api/documents'

export function useDocuments(courseId?: string) {
  return useQuery({
    queryKey: ['documents', courseId],
    queryFn: () => docsApi.getDocuments({ course_id: courseId }),
    staleTime: 60 * 1000,
  })
}

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ['documents', 'detail', documentId],
    queryFn: () => docsApi.getDocument(documentId),
    enabled: !!documentId,
  })
}

export function useUploadStatus(documentId: string | null) {
  return useQuery({
    queryKey: ['documents', 'upload-status', documentId],
    queryFn: () => docsApi.getUploadStatus(documentId!),
    enabled: !!documentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'ready' || status === 'error') return false
      return 3000
    },
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, userId, courseId }: { file: File; userId: string; courseId?: string }) =>
      docsApi.uploadDocument(file, userId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => docsApi.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
