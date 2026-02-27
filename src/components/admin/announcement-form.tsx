'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateAnnouncement, useUpdateAnnouncement } from '@/lib/hooks/use-admin'
import { toast } from 'sonner'
import type { Announcement, AnnouncementCreate } from '@/lib/types/admin'

interface AnnouncementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement?: Announcement | null
}

export function AnnouncementForm({ open, onOpenChange, announcement }: AnnouncementFormProps) {
  const isEditing = !!announcement
  const createMutation = useCreateAnnouncement()
  const updateMutation = useUpdateAnnouncement()

  const [title, setTitle] = useState(announcement?.title || '')
  const [message, setMessage] = useState(announcement?.message || '')
  const [type, setType] = useState<string>(announcement?.type || 'info')
  const [dismissible, setDismissible] = useState(announcement?.dismissible ?? true)

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required')
      return
    }

    if (isEditing && announcement) {
      updateMutation.mutate(
        {
          id: announcement.id,
          data: { title, message, type, dismissible },
        },
        {
          onSuccess: () => {
            toast.success('Announcement updated')
            onOpenChange(false)
          },
          onError: (err) => toast.error(err.message),
        },
      )
    } else {
      const data: AnnouncementCreate = { title, message, type, dismissible }
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Announcement created')
          onOpenChange(false)
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the announcement details.' : 'Create a new announcement for all users.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Announcement message..."
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Dismissible</Label>
              <div className="flex items-center gap-2 h-10">
                <input
                  type="checkbox"
                  checked={dismissible}
                  onChange={(e) => setDismissible(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm text-muted-foreground">Can dismiss</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
