'use client'

import { useState } from 'react'
import { Plus, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CourseCard } from '@/components/courses/course-card'
import { CreateCourseDialog } from '@/components/courses/create-course-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { CourseCardSkeleton } from '@/components/shared/loading-skeleton'
import { useCourses, useDeleteCourse, useUpdateCourse } from '@/lib/hooks/use-courses'
import { useDocuments } from '@/lib/hooks/use-documents'
import type { Course } from '@/lib/types/course'
import { toast } from 'sonner'

export default function CoursesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: courses, isLoading } = useCourses()
  const { data: docsData } = useDocuments()
  const deleteCourse = useDeleteCourse()
  const updateCourse = useUpdateCourse()

  const docCountByCourse = (docsData?.documents || []).reduce<Record<string, number>>((acc, doc) => {
    if (doc.course_id) acc[doc.course_id] = (acc[doc.course_id] || 0) + 1
    return acc
  }, {})

  const handleRename = (course: Course) => {
    const name = prompt('Rename course:', course.name)
    if (name && name !== course.name) {
      updateCourse.mutate(
        { courseId: course.id, data: { name } },
        { onSuccess: () => toast.success('Course renamed') },
      )
    }
  }

  const handleDelete = (course: Course) => {
    if (confirm(`Delete "${course.name}"? Documents will be moved to General.`)) {
      deleteCourse.mutate(course.id, {
        onSuccess: () => toast.success('Course deleted'),
        onError: (err) => toast.error(err.message),
      })
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize your study materials</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New course
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <CourseCardSkeleton key={i} />)}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              documentCount={docCountByCourse[course.id] || 0}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to start organizing your study materials."
          action={{ label: 'Create course', onClick: () => setCreateOpen(true) }}
        />
      )}

      <CreateCourseDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
