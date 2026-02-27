'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useAnnouncements, useUpdateAnnouncement, useDeleteAnnouncement } from '@/lib/hooks/use-admin'
import { AnnouncementForm } from '@/components/admin/announcement-form'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import type { Announcement } from '@/lib/types/admin'

const TYPE_BADGE: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  maintenance: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function AnnouncementsPanel() {
  const { data, isLoading } = useAnnouncements()
  const updateMutation = useUpdateAnnouncement()
  const deleteMutation = useDeleteAnnouncement()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement)
    setFormOpen(true)
  }

  const toggleActive = (announcement: Announcement) => {
    updateMutation.mutate(
      { id: announcement.id, data: { is_active: !announcement.is_active } },
      {
        onSuccess: () => toast.success(announcement.is_active ? 'Deactivated' : 'Activated'),
        onError: (err) => toast.error(err.message),
      },
    )
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this announcement?')) return
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Announcement deleted'),
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Announcements</h2>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          New
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data?.announcements.length === 0 ? (
        <p className="text-muted-foreground text-sm">No announcements yet</p>
      ) : (
        <div className="space-y-3">
          {data?.announcements.map((a) => (
            <Card key={a.id} className={cn(!a.is_active && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', TYPE_BADGE[a.type] || TYPE_BADGE.info)}>
                        {a.type}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        a.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                      )}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive(a)}
                      className="h-8 px-2.5 rounded-md text-xs font-medium border border-border hover:bg-secondary transition-colors"
                    >
                      {a.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEdit(a)}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-secondary text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AnnouncementForm
        key={editing?.id || 'new'}
        open={formOpen}
        onOpenChange={setFormOpen}
        announcement={editing}
      />
    </div>
  )
}
