'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Users, Crown, UserPlus, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useAdminAnalytics, useAnnouncements } from '@/lib/hooks/use-admin'
import { StatCard } from '@/components/admin/stat-card'
import { SignupChart } from '@/components/admin/signup-chart'
import { TierPieChart } from '@/components/admin/tier-pie-chart'
import { EngagementBarChart } from '@/components/admin/engagement-bar-chart'
import { UsersTable } from '@/components/admin/users-table'
import { AnnouncementsPanel } from '@/components/admin/announcements-panel'

export type AdminTab = 'overview' | 'users' | 'announcements'

export default function AdminPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = (searchParams.get('tab') || 'overview') as AdminTab

  const setTab = (t: AdminTab) => {
    router.push(t === 'overview' ? '/admin' : `/admin?tab=${t}`, { scroll: false })
  }

  const { data, isLoading } = useAdminAnalytics()
  const announcements = useAnnouncements()

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards — always visible, clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setTab('users')} className="text-left">
          <StatCard
            icon={Users}
            iconColor="text-blue-500"
            value={data?.overview.total_users}
            label="Total Users"
            loading={isLoading}
            active={tab === 'users'}
          />
        </button>
        <button onClick={() => setTab('overview')} className="text-left">
          <StatCard
            icon={Crown}
            iconColor="text-orange-500"
            value={data?.overview.pro_users}
            label="Pro Subscribers"
            loading={isLoading}
          />
        </button>
        <button onClick={() => setTab('overview')} className="text-left">
          <StatCard
            icon={UserPlus}
            iconColor="text-green-500"
            value={data?.overview.new_users_7d}
            label="New This Week"
            loading={isLoading}
          />
        </button>
        <button onClick={() => setTab('announcements')} className="text-left">
          <StatCard
            icon={FileText}
            iconColor="text-purple-500"
            value={announcements.data?.announcements.length}
            label="Announcements"
            loading={announcements.isLoading}
            active={tab === 'announcements'}
          />
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SignupChart data={data.recent_signups} />
              <TierPieChart data={data.users_by_tier} />
              <EngagementBarChart data={data.engagement_breakdown} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Pro Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.pro_subscribers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pro subscribers yet</p>
                  ) : (
                    <div className="space-y-3">
                      {data.pro_subscribers.slice(0, 5).map((sub) => (
                        <div key={sub.email} className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{sub.email}</span>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">
                            {new Date(sub.signup_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </>
      )}

      {tab === 'users' && (
        <>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          ) : data ? (
            <UsersTable users={data.users_activity} />
          ) : (
            <p className="text-muted-foreground">Failed to load users</p>
          )}
        </>
      )}

      {tab === 'announcements' && (
        <AnnouncementsPanel />
      )}
    </div>
  )
}
