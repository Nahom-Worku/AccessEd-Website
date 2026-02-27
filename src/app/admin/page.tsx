'use client'

import { Users, Crown, UserPlus, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useAdminAnalytics } from '@/lib/hooks/use-admin'
import { StatCard } from '@/components/admin/stat-card'
import { SignupChart } from '@/components/admin/signup-chart'
import { TierPieChart } from '@/components/admin/tier-pie-chart'
import { EngagementBarChart } from '@/components/admin/engagement-bar-chart'

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminAnalytics()

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          iconColor="text-blue-500"
          value={data?.overview.total_users}
          label="Total Users"
          loading={isLoading}
        />
        <StatCard
          icon={Crown}
          iconColor="text-orange-500"
          value={data?.overview.pro_users}
          label="Pro Subscribers"
          loading={isLoading}
        />
        <StatCard
          icon={UserPlus}
          iconColor="text-green-500"
          value={data?.overview.new_users_7d}
          label="New This Week"
          loading={isLoading}
        />
        <StatCard
          icon={FileText}
          iconColor="text-purple-500"
          value={data?.overview.total_documents}
          label="Total Documents"
          loading={isLoading}
        />
      </div>

      {/* Charts */}
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

          {/* Pro Subscribers */}
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
    </div>
  )
}
