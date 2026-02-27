import { apiClient } from './client'
import type { Course, CourseCreate, CourseUpdate } from '@/lib/types/course'

export async function getCourses(userId: string, includeGeneral = true): Promise<Course[]> {
  return apiClient<Course[]>(`/courses?user_id=${userId}&include_general=${includeGeneral}`)
}

export async function getCourse(courseId: string): Promise<Course> {
  return apiClient<Course>(`/courses/${courseId}`)
}

export async function createCourse(data: CourseCreate): Promise<Course> {
  return apiClient<Course>('/courses', {
    method: 'POST',
    body: data,
  })
}

export async function updateCourse(courseId: string, data: CourseUpdate): Promise<Course> {
  return apiClient<Course>(`/courses/${courseId}`, {
    method: 'PUT',
    body: data,
  })
}

export async function deleteCourse(courseId: string): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/courses/${courseId}`, {
    method: 'DELETE',
  })
}
