'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, RotateCw, ThumbsDown, ThumbsUp, Lightbulb, Star,
  CheckCircle, Flame, Trophy, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useCourse } from '@/lib/hooks/use-courses'
import { getStudySession, reviewFlashcard, getDueCount } from '@/lib/api/flashcards'
import { recordActivity } from '@/lib/api/engagement'
import type { FlashcardRating } from '@/lib/types/flashcard'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function FlashcardsPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  const { data: course } = useCourse(courseId)
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [ratings, setRatings] = useState<Record<string, FlashcardRating>>({})

  const { data: session, isLoading } = useQuery({
    queryKey: ['flashcards', 'study-session', courseId],
    queryFn: () => getStudySession({ course_id: courseId }),
  })

  const { data: dueData } = useQuery({
    queryKey: ['flashcards', 'due-count', courseId],
    queryFn: () => getDueCount(courseId),
  })

  const cards = session?.cards || []
  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? ((currentIndex + (sessionComplete ? 1 : 0)) / cards.length) * 100 : 0

  const handleRate = useCallback(async (rating: FlashcardRating) => {
    if (!currentCard || reviewing) return
    setReviewing(true)
    try {
      await reviewFlashcard({ flashcard_id: currentCard.id, rating })
      setRatings(prev => ({ ...prev, [currentCard.id]: rating }))
      setFlipped(false)

      if (currentIndex < cards.length - 1) {
        setTimeout(() => setCurrentIndex(prev => prev + 1), 200)
      } else {
        setSessionComplete(true)
        queryClient.invalidateQueries({ queryKey: ['flashcards'] })
        // Record activity for gamification
        try {
          await recordActivity({ activity_type: 'flashcard', topics_count: cards.length })
        } catch { /* silent */ }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review'
      toast.error(msg)
    } finally {
      setReviewing(false)
    }
  }, [currentCard, currentIndex, cards.length, reviewing, queryClient, cards])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (sessionComplete) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!flipped) setFlipped(true)
      }
      if (flipped && !reviewing) {
        if (e.key === '1') handleRate('again')
        if (e.key === '2') handleRate('hard')
        if (e.key === '3') handleRate('good')
        if (e.key === '4') handleRate('easy')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flipped, reviewing, sessionComplete, handleRate])

  // Session complete stats
  const sessionStats = {
    total: cards.length,
    again: Object.values(ratings).filter(r => r === 'again').length,
    hard: Object.values(ratings).filter(r => r === 'hard').length,
    good: Object.values(ratings).filter(r => r === 'good').length,
    easy: Object.values(ratings).filter(r => r === 'easy').length,
  }

  if (sessionComplete) {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Session Complete!</h1>
          <p className="text-muted-foreground mb-6">
            You reviewed {sessionStats.total} cards
          </p>

          {/* Rating breakdown */}
          <div className="grid grid-cols-4 gap-3 mb-8 max-w-sm mx-auto">
            {[
              { label: 'Again', count: sessionStats.again, color: 'text-red-500', bg: 'bg-red-500/10' },
              { label: 'Hard', count: sessionStats.hard, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Good', count: sessionStats.good, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Easy', count: sessionStats.easy, color: 'text-green-500', bg: 'bg-green-500/10' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={cn('text-2xl font-bold', s.color)}>{s.count}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Link href={`/courses/${courseId}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to course
              </Button>
            </Link>
            <Button onClick={() => {
              setCurrentIndex(0)
              setFlipped(false)
              setSessionComplete(false)
              setRatings({})
              queryClient.invalidateQueries({ queryKey: ['flashcards', 'study-session', courseId] })
            }}>
              <RotateCw className="h-4 w-4 mr-2" />
              Study again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Flashcards</h1>
          <p className="text-xs text-muted-foreground">
            {course?.name} {dueData ? `· ${dueData.due_count} due` : ''}
          </p>
        </div>
      </div>

      {/* Progress */}
      {cards.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{currentIndex + 1} of {cards.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No flashcards due"
          description="Complete quizzes to generate flashcards, or create them manually. Flashcards will appear here when they're due for review."
        />
      ) : currentCard ? (
        <>
          {/* Card with flip animation */}
          <div
            className="cursor-pointer mb-6 [perspective:1200px]"
            onClick={() => setFlipped(!flipped)}
          >
            <div className={cn(
              'relative w-full min-h-[260px] transition-transform duration-500 [transform-style:preserve-3d]',
              flipped && '[transform:rotateY(180deg)]',
            )}>
              {/* Front */}
              <Card className="absolute inset-0 [backface-visibility:hidden] flex items-center justify-center">
                <CardContent className="p-8 text-center w-full">
                  <p className="text-[11px] text-muted-foreground mb-4 uppercase tracking-wider font-medium">Question</p>
                  <p className="text-lg font-medium leading-relaxed">{currentCard.front}</p>
                  {currentCard.hint && (
                    <p className="text-xs text-brand/70 mt-4 italic">Hint: {currentCard.hint}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-6">Tap to reveal · Space</p>
                </CardContent>
              </Card>

              {/* Back */}
              <Card className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center bg-secondary">
                <CardContent className="p-8 text-center w-full">
                  <p className="text-[11px] text-muted-foreground mb-4 uppercase tracking-wider font-medium">Answer</p>
                  <p className="text-lg font-medium leading-relaxed">{currentCard.back}</p>
                  {currentCard.subtopic_display_name && (
                    <p className="text-xs text-muted-foreground mt-4">{currentCard.subtopic_display_name}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Rating Buttons - visible when flipped */}
          <div className={cn(
            'transition-all duration-300',
            flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
          )}>
            <p className="text-xs text-center text-muted-foreground mb-3">How well did you know this?</p>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-red-500/30 text-red-500 hover:bg-red-500/5"
                onClick={() => handleRate('again')}
                disabled={reviewing}
              >
                <ThumbsDown className="h-4 w-4 mb-1" />
                <span className="text-xs">Again</span>
                <span className="text-[10px] text-muted-foreground">1</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-orange-500/30 text-orange-500 hover:bg-orange-500/5"
                onClick={() => handleRate('hard')}
                disabled={reviewing}
              >
                <RotateCw className="h-4 w-4 mb-1" />
                <span className="text-xs">Hard</span>
                <span className="text-[10px] text-muted-foreground">2</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-blue-500/30 text-blue-500 hover:bg-blue-500/5"
                onClick={() => handleRate('good')}
                disabled={reviewing}
              >
                <ThumbsUp className="h-4 w-4 mb-1" />
                <span className="text-xs">Good</span>
                <span className="text-[10px] text-muted-foreground">3</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-green-500/30 text-green-500 hover:bg-green-500/5"
                onClick={() => handleRate('easy')}
                disabled={reviewing}
              >
                <Star className="h-4 w-4 mb-1" />
                <span className="text-xs">Easy</span>
                <span className="text-[10px] text-muted-foreground">4</span>
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
