'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LayoutDashboard, Users, Megaphone, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { tab: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { tab: 'users', label: 'Users', icon: Users },
  { tab: 'announcements', label: 'Announcements', icon: Megaphone },
]

export function AdminSidebar() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-brand font-bold text-lg">A</span>
          </div>
          <div>
            <span className="font-semibold text-lg">AccessEd</span>
            <span className="ml-1.5 text-xs font-medium text-muted-foreground">Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab
          const href = item.tab === 'overview' ? '/admin' : `/admin?tab=${item.tab}`
          return (
            <Link
              key={item.tab}
              href={href}
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

      <div className="px-3 pb-4">
        <Link
          href="/home"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to App
        </Link>
      </div>
    </aside>
  )
}
