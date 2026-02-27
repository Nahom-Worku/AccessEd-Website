'use client'

import Link from 'next/link'
import { BookOpen, FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Course } from '@/lib/types/course'

interface CourseCardProps {
  course: Course
  documentCount?: number
  onRename: (course: Course) => void
  onDelete: (course: Course) => void
}

export function CourseCard({ course, documentCount = 0, onRename, onDelete }: CourseCardProps) {
  const color = course.color || '#2563EB'

  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <div className="h-1" style={{ backgroundColor: color }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <BookOpen className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{course.name}</h3>
              <p className="text-xs text-muted-foreground">
                {documentCount} {documentCount === 1 ? 'document' : 'documents'}
              </p>
            </div>
          </div>

          {!course.is_general && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRename(course)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(course)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Link href={`/courses/${course.id}`}>
          <Button
            variant="outline"
            className="w-full"
            style={{ borderColor: `${color}40`, color }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Open course
          </Button>
        </Link>
      </div>
    </div>
  )
}
