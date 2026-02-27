'use client'

import { useAdminAnalytics } from '@/lib/hooks/use-admin'
import { UsersTable } from '@/components/admin/users-table'
import { Skeleton } from '@/components/shared/loading-skeleton'

export default function AdminUsersPage() {
  const { data, isLoading } = useAdminAnalytics()

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

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
    </div>
  )
}
