'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen, MessageSquare, GraduationCap, Flame, Zap, ArrowRight,
  Upload, Brain, ClipboardCheck, ChevronRight, Sparkles, X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useCourses } from '@/lib/hooks/use-courses'
import { useStreak, useXPStats } from '@/lib/hooks/use-engagement'
import { getDueCount } from '@/lib/api/flashcards'
import { completeOnboarding } from '@/lib/api/auth'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils/cn'

// ─── Onboarding ─────────────────────────────────────────────────────

const onboardingSteps = [
  {
    icon: BookOpen,
    title: 'Create your first course',
    description: 'Courses organize your documents. Name one after a class, textbook, or topic.',
    action: 'Go to Courses',
    href: '/courses',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Upload,
    title: 'Upload a PDF',
    description: 'Drop a textbook, lecture slides, or notes. AccessEd will index every page for precise retrieval.',
    action: 'Upload document',
    href: '/courses',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Ask your first question',
    description: 'Get page-verified answers with citations. The AI reads your documents, not the internet.',
    action: 'Open AI Chat',
    href: '/chat',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: ClipboardCheck,
    title: 'Take a quiz',
    description: 'Generate adaptive quizzes from your documents. Wrong answers feed your mistake journal automatically.',
    action: 'Generate quiz',
    href: '/courses',
    color: 'text-brand',
    bg: 'bg-brand/10',
  },
]

function OnboardingBanner({ onDismiss }: { onDismiss: () => void }) {
  const router = useRouter()
  const { data: courses } = useCourses()
  const hasCourses = (courses?.length ?? 0) > 0

  // Determine which step to highlight
  const currentStep = hasCourses ? 1 : 0

  return (
    <div className="relative rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-purple-500/5 p-6 mb-8">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-bold">Welcome to AccessEd</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Get started in 4 steps. Each one unlocks more of the learning engine.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {onboardingSteps.map((step, i) => {
          const isActive = i === currentStep
          const isComplete = i < currentStep
          return (
            <button
              key={i}
              onClick={() => router.push(step.href)}
              className={cn(
                'text-left p-4 rounded-xl border transition-all group',
                isActive && 'border-brand/30 bg-background shadow-sm',
                isComplete && 'border-green-500/20 bg-green-500/5 opacity-60',
                !isActive && !isComplete && 'border-border/50 opacity-50',
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', step.bg)}>
                  {isComplete ? (
                    <span className="text-green-500 text-sm font-bold">&#10003;</span>
                  ) : (
                    <step.icon className={cn('h-4 w-4', step.color)} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{step.description}</p>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-brand shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Home Page ─────────────────────────────────────────────────

export default function HomePage() {
  const { user, setUser } = useAuthStore()
  const { data: courses, isLoading: coursesLoading } = useCourses()
  const { data: streak } = useStreak()
  const { data: xp } = useXPStats()
  const { data: dueData } = useQuery({
    queryKey: ['flashcards', 'due-count'],
    queryFn: () => getDueCount(),
  })

  const [showOnboarding, setShowOnboarding] = useState(!user?.has_completed_onboarding)

  const dismissOnboarding = useCallback(async () => {
    setShowOnboarding(false)
    try {
      await completeOnboarding()
      if (user) setUser({ ...user, has_completed_onboarding: true })
    } catch { /* silent */ }
  }, [user, setUser])

  const firstName = user?.full_name?.split(' ')[0] || user?.username || 'there'
  const dueCount = dueData?.due_count ?? 0

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Hey, {firstName}</h1>
        <p className="text-muted-foreground mt-1">Ready to learn something new?</p>
      </div>

      {/* Onboarding */}
      {showOnboarding && <OnboardingBanner onDismiss={dismissOnboarding} />}

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

      {/* Due Flashcards Nudge */}
      {dueCount > 0 && (
        <Link href={courses?.[0] ? `/courses/${courses[0].id}/flashcards` : '/courses'}>
          <Card className="border-blue-500/20 bg-blue-500/5 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">You have {dueCount} flashcard{dueCount !== 1 ? 's' : ''} due for review</p>
                <p className="text-xs text-muted-foreground">Review now for optimal retention</p>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-500 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      )}

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
