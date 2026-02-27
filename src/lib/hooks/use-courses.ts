'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as coursesApi from '@/lib/api/courses'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { CourseUpdate } from '@/lib/types/course'

export function useCourses() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['courses', user?.id],
    queryFn: () => coursesApi.getCourses(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['courses', courseId],
    queryFn: () => coursesApi.getCourse(courseId),
    enabled: !!courseId,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (name: string) => coursesApi.createCourse({ user_id: user!.id, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: CourseUpdate }) =>
      coursesApi.updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => coursesApi.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}
