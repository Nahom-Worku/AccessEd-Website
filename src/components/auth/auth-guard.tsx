'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getAccessToken } from '@/lib/utils/tokens'
import { PageSkeleton } from '@/components/shared/loading-skeleton'

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated && !getAccessToken()) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated && !getAccessToken()) {
    return <PageSkeleton />
  }

  return <>{children}</>
}
