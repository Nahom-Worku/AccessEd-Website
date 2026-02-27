import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  icon: LucideIcon
  iconColor: string
  value: number | string | undefined
  label: string
  loading?: boolean
  active?: boolean
}

export function StatCard({ icon: Icon, iconColor, value, label, loading, active }: StatCardProps) {
  return (
    <Card className={cn(
      'transition-all hover:shadow-md cursor-pointer',
      active && 'ring-2 ring-foreground/20',
    )}>
      <CardContent className="p-4 text-center">
        <Icon className={`h-6 w-6 mx-auto mb-2 ${iconColor}`} />
        {loading ? (
          <Skeleton className="h-8 w-12 mx-auto" />
        ) : (
          <p className="text-2xl font-bold">{value ?? 0}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
