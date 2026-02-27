'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Home, BookOpen, MessageSquare, GraduationCap, BarChart3, Settings, Crown, Shield } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/lib/stores/ui-store'
import { useAuthStore } from '@/lib/stores/auth-store'

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/learn', label: 'Learn', icon: GraduationCap },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const { mobileNavOpen, setMobileNavOpen } = useUIStore()
  const { tier, user } = useAuthStore()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname, setMobileNavOpen])

  if (!mobileNavOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-4 animate-slide-in-right">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-brand font-bold text-lg">A</span>
            </div>
            <span className="font-semibold text-lg">AccessEd</span>
          </div>
          <button onClick={() => setMobileNavOpen(false)} className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1">
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
          {tier !== 'pro' && (
            <Link
              href="/upgrade"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand hover:bg-brand/10"
            >
              <Crown className="h-5 w-5" />
              Upgrade to Pro
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
              )}
            >
              <Shield className="h-5 w-5" />
              Admin
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}
