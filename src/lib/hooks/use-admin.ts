'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as adminApi from '@/lib/api/admin'
import type { AnnouncementCreate, AnnouncementUpdate } from '@/lib/types/admin'

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => adminApi.getAnalytics(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: () => adminApi.getAnnouncements(),
    staleTime: 60 * 1000,
  })
}

export function useSetUserTier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, tier }: { email: string; tier: string }) =>
      adminApi.setUserTier(email, tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] })
    },
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AnnouncementCreate) => adminApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    },
  })
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AnnouncementUpdate }) =>
      adminApi.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    },
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    },
  })
}
