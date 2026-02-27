'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCreateCourse } from '@/lib/hooks/use-courses'
import { toast } from 'sonner'

interface CreateCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const [name, setName] = useState('')
  const createCourse = useCreateCourse()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    createCourse.mutate(name.trim(), {
      onSuccess: () => {
        toast.success('Course created')
        setName('')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create course')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new course</DialogTitle>
          <DialogDescription>
            Organize your documents and study materials by course.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">Course name</Label>
              <Input
                id="course-name"
                placeholder="e.g. Biology 101"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createCourse.isPending}>
              {createCourse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
