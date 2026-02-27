'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getAccessToken } from '@/lib/utils/tokens'
import { PageSkeleton } from '@/components/shared/loading-skeleton'

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated && !getAccessToken()) {
      router.replace('/login')
      return
    }
    if (isAuthenticated && user?.role !== 'admin') {
      router.replace('/home')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== 'admin') {
    return <PageSkeleton />
  }

  return <>{children}</>
}
