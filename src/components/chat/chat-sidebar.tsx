'use client'

import { useState, useMemo } from 'react'
import { Plus, MessageSquare, Trash2, Pencil, Check, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime } from '@/lib/utils/format'
import { useChatStore } from '@/lib/stores/chat-store'
import { useChatSessions } from '@/lib/hooks/use-chat'
import type { ChatSession } from '@/lib/types/chat'

function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  session: ChatSession
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (title: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')

  return (
    <div
      className={cn(
        'group relative flex items-center rounded-lg px-2.5 py-2 text-sm cursor-pointer transition-colors',
        isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
      )}
      onClick={() => {
        if (!editing) onSelect()
      }}
    >
      {editing ? (
        <form
          className="flex-1 flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault()
            if (editTitle.trim()) onRename(editTitle.trim())
            setEditing(false)
          }}
        >
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none border-b border-brand"
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditing(false)
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button type="submit" className="p-0.5">
            <Check className="h-3 w-3" />
          </button>
        </form>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px]">{session.title || 'New chat'}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              {formatRelativeTime(session.updated_at || session.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditing(true)
                setEditTitle(session.title || '')
              }}
              className="p-1 rounded hover:bg-background/80 transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 rounded hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function ChatSidebar({
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
}: {
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string) => void
  onRenameSession: (id: string, title: string) => void
}) {
  const { activeSessionId, sessionSearch, setSessionSearch, sidebarOpen } = useChatStore()
  const { data: sessions = [], isLoading } = useChatSessions()

  const filtered = useMemo(() => {
    if (!sessionSearch.trim()) return sessions
    const q = sessionSearch.toLowerCase()
    return sessions.filter((s) => (s.title || '').toLowerCase().includes(q))
  }, [sessions, sessionSearch])

  const grouped = useMemo(() => {
    const groups: { label: string; items: ChatSession[] }[] = []
    const today: ChatSession[] = []
    const yesterday: ChatSession[] = []
    const thisWeek: ChatSession[] = []
    const older: ChatSession[] = []

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 86400000)
    const weekStart = new Date(todayStart.getTime() - 7 * 86400000)

    for (const s of filtered) {
      const d = new Date(s.updated_at || s.created_at)
      if (d >= todayStart) today.push(s)
      else if (d >= yesterdayStart) yesterday.push(s)
      else if (d >= weekStart) thisWeek.push(s)
      else older.push(s)
    }

    if (today.length) groups.push({ label: 'Today', items: today })
    if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday })
    if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek })
    if (older.length) groups.push({ label: 'Older', items: older })

    return groups
  }, [filtered])

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="shrink-0 border-r border-border bg-card/50 overflow-hidden h-full"
        >
          <div className="w-[280px] h-full flex flex-col">
            {/* New Chat + Search */}
            <div className="p-3 space-y-2 shrink-0">
              <Button onClick={onNewChat} className="w-full justify-start gap-2" variant="outline" size="sm">
                <Plus className="h-4 w-4" />
                New chat
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-8 py-1.5 rounded-md border border-border bg-background text-xs outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                />
                {sessionSearch && (
                  <button
                    onClick={() => setSessionSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto px-2 pb-3">
              {isLoading ? (
                <div className="space-y-2 px-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-secondary/50 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    {sessionSearch ? 'No matching conversations' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grouped.map((group) => (
                    <div key={group.label}>
                      <p className="text-[11px] font-medium text-muted-foreground px-2 mb-1 uppercase tracking-wider">
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((session) => (
                          <SessionItem
                            key={session.id}
                            session={session}
                            isActive={activeSessionId === session.id}
                            onSelect={() => onSelectSession(session.id)}
                            onDelete={() => onDeleteSession(session.id)}
                            onRename={(title) => onRenameSession(session.id, title)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
