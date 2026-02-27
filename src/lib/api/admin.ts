import type {
  AdminAnalytics,
  Announcement,
  AnnouncementCreate,
  AnnouncementUpdate,
} from '@/lib/types/admin'
import { getAccessToken } from '@/lib/utils/tokens'

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`/api/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Request failed: ${res.status}`)
  }

  return res.json()
}

export async function getAnalytics(): Promise<AdminAnalytics> {
  return adminFetch('/analytics')
}

export async function setUserTier(
  email: string,
  tier: string,
): Promise<{ status: string; user: { id: string; email: string; tier: string } }> {
  return adminFetch('/set-tier', {
    method: 'PUT',
    body: JSON.stringify({ email, tier }),
  })
}

export async function getAnnouncements(): Promise<{ announcements: Announcement[] }> {
  return adminFetch('/announcements')
}

export async function createAnnouncement(
  data: AnnouncementCreate,
): Promise<{ success: boolean; announcement_id: string }> {
  return adminFetch('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAnnouncement(
  id: string,
  data: AnnouncementUpdate,
): Promise<{ success: boolean }> {
  return adminFetch(`/announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteAnnouncement(
  id: string,
): Promise<{ success: boolean }> {
  return adminFetch(`/announcements/${id}`, {
    method: 'DELETE',
  })
}
