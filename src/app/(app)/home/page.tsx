'use client'

import Link from 'next/link'
import { BookOpen, MessageSquare, GraduationCap, Flame, Zap, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useCourses } from '@/lib/hooks/use-courses'
import { useStreak, useXPStats } from '@/lib/hooks/use-engagement'

export default function HomePage() {
  const { user } = useAuthStore()
  const { data: courses, isLoading: coursesLoading } = useCourses()
  const { data: streak } = useStreak()
  const { data: xp } = useXPStats()

  const firstName = user?.full_name?.split(' ')[0] || user?.username || 'there'

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Hey, {firstName}</h1>
        <p className="text-muted-foreground mt-1">Ready to learn something new?</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{streak?.current_streak ?? 0}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{xp?.total_xp ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{courses?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{xp?.level ?? 1}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/courses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand" />
                My Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload documents, generate quizzes, and study flashcards.
              </p>
              <Button variant="ghost" size="sm" className="mt-3 -ml-3 text-brand">
                Open courses <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/chat">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand" />
                AI Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask questions about your documents with page-verified citations.
              </p>
              <Button variant="ghost" size="sm" className="mt-3 -ml-3 text-brand">
                Start chat <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/learn">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-brand" />
                Learning Hub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review mistakes, practice weak topics, and track mastery.
              </p>
              <Button variant="ghost" size="sm" className="mt-3 -ml-3 text-brand">
                Open hub <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Courses */}
      {coursesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : courses && courses.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Courses</h2>
            <Link href="/courses" className="text-sm text-brand hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.slice(0, 3).map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: course.color || '#2563EB' }} />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${course.color || '#2563EB'}15` }}
                      >
                        <BookOpen className="h-4 w-4" style={{ color: course.color || '#2563EB' }} />
                      </div>
                      <span className="font-medium text-sm">{course.name}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
