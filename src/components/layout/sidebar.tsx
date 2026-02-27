'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  MessageSquare,
  GraduationCap,
  BarChart3,
  Settings,
  Crown,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useStreak } from '@/lib/hooks/use-engagement'
import { useAuthStore } from '@/lib/stores/auth-store'

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/learn', label: 'Learn', icon: GraduationCap },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
]

const bottomItems = [
  { href: '/upgrade', label: 'Upgrade', icon: Crown },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: streak } = useStreak()
  const { tier } = useAuthStore()

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      <div className="p-6">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-brand font-bold text-lg">A</span>
          </div>
          <span className="font-semibold text-lg">AccessEd</span>
        </Link>
      </div>

      {streak && streak.current_streak > 0 && (
        <div className="mx-4 mb-4 px-3 py-2 rounded-lg bg-secondary flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">{streak.current_streak} day streak</span>
        </div>
      )}

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        {bottomItems.map((item) => {
          if (item.href === '/upgrade' && tier === 'pro') return null
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                item.href === '/upgrade' && 'text-brand hover:text-brand',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
