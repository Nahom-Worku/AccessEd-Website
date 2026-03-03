'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, BarChart3, ArrowRight, Flame, Zap, BookOpen,
  Brain, Target, ClipboardCheck, Clock, TrendingUp, Lightbulb,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useQuery } from '@tanstack/react-query'
import { useStreak, useXPStats } from '@/lib/hooks/use-engagement'
import { useCourses } from '@/lib/hooks/use-courses'
import { getMistakePatterns } from '@/lib/api/mistakes'
import { getDueCount } from '@/lib/api/flashcards'
import { cn } from '@/lib/utils/cn'

export default function LearnPage() {
  const { data: streak } = useStreak()
  const { data: xp } = useXPStats()
  const { data: courses } = useCourses()
  const { data: mistakes, isLoading: mistakesLoading } = useQuery({
    queryKey: ['mistakes', 'patterns'],
    queryFn: () => getMistakePatterns({ limit: 5, include_questions: false }),
  })
  const { data: dueData } = useQuery({
    queryKey: ['flashcards', 'due-count'],
    queryFn: () => getDueCount(),
  })

  const dueCount = dueData?.due_count ?? 0
  const mistakeCount = mistakes?.summary?.total_cards_remaining ?? 0

  // Build smart recommendations
  const recommendations = useMemo(() => {
    const items: { icon: typeof Flame; title: string; description: string; href: string; priority: 'high' | 'medium' | 'low'; color: string }[] = []

    if (dueCount > 0) {
      items.push({
        icon: Brain,
        title: `Review ${dueCount} due flashcard${dueCount !== 1 ? 's' : ''}`,
        description: 'Spaced repetition cards are due. Review now for optimal retention.',
        href: courses?.[0] ? `/courses/${courses[0].id}/flashcards` : '/courses',
        priority: 'high',
        color: 'text-blue-500',
      })
    }

    if (mistakeCount > 0) {
      items.push({
        icon: AlertTriangle,
        title: `${mistakeCount} mistakes to review`,
        description: 'Turn your weaknesses into strengths by practicing incorrect answers.',
        href: '/learn/mistakes',
        priority: 'high',
        color: 'text-red-500',
      })
    }

    if (courses && courses.length > 0) {
      items.push({
        icon: ClipboardCheck,
        title: 'Take a quiz',
        description: 'Test your knowledge and discover new weak spots.',
        href: `/courses/${courses[0].id}/quiz`,
        priority: 'medium',
        color: 'text-purple-500',
      })
    }

    if (items.length === 0) {
      items.push({
        icon: BookOpen,
        title: 'Start studying',
        description: 'Upload documents and start asking questions to build your knowledge graph.',
        href: '/courses',
        priority: 'low',
        color: 'text-brand',
      })
    }

    return items
  }, [dueCount, mistakeCount, courses])

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header with urgency stats */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Learning Hub</h1>
        <p className="text-muted-foreground text-sm">Your personalized study plan, updated in real-time.</p>
      </div>

      {/* Urgency Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{streak?.current_streak ?? 0}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Brain className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{dueCount}</p>
              <p className="text-xs text-muted-foreground">Cards due</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{xp?.total_xp ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{mistakeCount}</p>
              <p className="text-xs text-muted-foreground">Mistakes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* XP Level Progress */}
      {xp && (
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                <span className="text-sm font-semibold">Level {xp.level}</span>
              </div>
              <span className="text-xs text-muted-foreground">{xp.xp_to_next_level} XP to next level</span>
            </div>
            <Progress value={xp.level_progress_percent} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Smart Recommendations */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-4 w-4 text-brand" />
          <h2 className="text-base font-semibold">Recommended Next</h2>
        </div>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <Link key={i} href={rec.href}>
              <Card className={cn(
                'hover:shadow-md transition-all cursor-pointer group',
                rec.priority === 'high' && 'border-l-2 border-l-red-500',
              )}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    rec.color === 'text-blue-500' && 'bg-blue-500/10',
                    rec.color === 'text-red-500' && 'bg-red-500/10',
                    rec.color === 'text-purple-500' && 'bg-purple-500/10',
                    rec.color === 'text-brand' && 'bg-brand/10',
                  )}>
                    <rec.icon className={cn('h-5 w-5', rec.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Weak Topics from Mistake Journal */}
      {!mistakesLoading && mistakes?.patterns && mistakes.patterns.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-red-500" />
              <h2 className="text-base font-semibold">Weak Topics</h2>
            </div>
            <Link href="/learn/mistakes" className="text-xs text-brand hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mistakes.patterns.slice(0, 4).map((pattern, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{pattern.subtopic_display_name || pattern.subtopic}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 shrink-0 ml-2">
                      {pattern.cards_remaining} due
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{pattern.parent_topic}</p>
                  {pattern.course_name && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{pattern.course_name}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/learn/mistakes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-5 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-red-500" />
              <h3 className="font-semibold text-sm mb-1">Mistake Journal</h3>
              <p className="text-xs text-muted-foreground">Review wrong answers by topic</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/learn/practice">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-5 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold text-sm mb-1">Practice Mode</h3>
              <p className="text-xs text-muted-foreground">Targeted practice on weak areas</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/progress">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-5 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold text-sm mb-1">Progress</h3>
              <p className="text-xs text-muted-foreground">Streaks, heatmap, XP history</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
