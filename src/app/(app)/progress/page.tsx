'use client'

import { Flame, Zap, Calendar, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useStreak, useStreakCalendar, useXPStats } from '@/lib/hooks/use-engagement'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/cn'

export default function ProgressPage() {
  const { data: streak, isLoading: streakLoading } = useStreak()
  const { data: calendar } = useStreakCalendar(90)
  const { data: xp, isLoading: xpLoading } = useXPStats()

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            {streakLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : (
              <p className="text-2xl font-bold">{streak?.current_streak ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">Day streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            {streakLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : (
              <p className="text-2xl font-bold">{streak?.longest_streak ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">Best streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            {xpLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : (
              <p className="text-2xl font-bold">{xp?.total_xp ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-500" />
            {xpLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : (
              <p className="text-2xl font-bold">{xp?.level ?? 1}</p>
            )}
            <p className="text-xs text-muted-foreground">Level</p>
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      {xp && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Level Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Level {xp.level}</span>
              <span className="text-muted-foreground">{xp.xp_to_next_level} XP to next level</span>
            </div>
            <Progress value={xp.level_progress_percent} />
          </CardContent>
        </Card>
      )}

      {/* Activity Heatmap */}
      {calendar && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity ({calendar.total_active_days} active days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {calendar.days.map((day, i) => (
                <div
                  key={i}
                  title={`${day.date}: ${day.interaction_count} interactions`}
                  className={cn(
                    'w-3 h-3 rounded-sm',
                    day.had_activity
                      ? day.interaction_count > 5
                        ? 'bg-green-500'
                        : day.interaction_count > 2
                          ? 'bg-green-400'
                          : 'bg-green-300'
                      : 'bg-secondary',
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
