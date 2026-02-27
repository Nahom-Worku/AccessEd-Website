'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminAnnouncementsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin?tab=announcements')
  }, [router])
  return null
}
