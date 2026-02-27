'use client'

import { use, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCw, ThumbsDown, ThumbsUp, Lightbulb, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useCourse } from '@/lib/hooks/use-courses'
import { getStudySession, reviewFlashcard } from '@/lib/api/flashcards'
import type { Flashcard, FlashcardRating } from '@/lib/types/flashcard'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function FlashcardsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const { data: course } = useCourse(courseId)
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  const { data: session, isLoading } = useQuery({
    queryKey: ['flashcards', 'study-session', courseId],
    queryFn: () => getStudySession({ course_id: courseId }),
  })

  const cards = session?.cards || []
  const currentCard = cards[currentIndex]

  const handleRate = useCallback(async (rating: FlashcardRating) => {
    if (!currentCard || reviewing) return
    setReviewing(true)
    try {
      await reviewFlashcard({ flashcard_id: currentCard.id, rating })
      setFlipped(false)
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        toast.success('Study session complete!')
        queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setReviewing(false)
    }
  }, [currentCard, currentIndex, cards.length, reviewing, queryClient])

  const color = course?.color || '#2563EB'

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Flashcards</h1>
          <p className="text-xs text-muted-foreground">
            {cards.length > 0 ? `${currentIndex + 1} of ${cards.length}` : 'No cards due'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No flashcards due"
          description="Complete quizzes to generate flashcards, or create them manually."
        />
      ) : currentCard ? (
        <>
          {/* Card */}
          <div
            className="perspective-1000 cursor-pointer mb-6"
            onClick={() => setFlipped(!flipped)}
          >
            <Card className={cn(
              'min-h-[240px] flex items-center justify-center transition-all duration-300',
              flipped && 'bg-secondary',
            )}>
              <CardContent className="p-8 text-center">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                  {flipped ? 'Answer' : 'Question'}
                </p>
                <p className="text-lg font-medium leading-relaxed">
                  {flipped ? currentCard.back : currentCard.front}
                </p>
                {!flipped && currentCard.hint && (
                  <p className="text-xs text-muted-foreground mt-4">Tap to flip</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rating Buttons */}
          {flipped && (
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-red-500/30 text-red-500 hover:bg-red-500/5"
                onClick={() => handleRate('again')}
                disabled={reviewing}
              >
                <ThumbsDown className="h-4 w-4 mb-1" />
                <span className="text-xs">Again</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-orange-500/30 text-orange-500 hover:bg-orange-500/5"
                onClick={() => handleRate('hard')}
                disabled={reviewing}
              >
                <RotateCw className="h-4 w-4 mb-1" />
                <span className="text-xs">Hard</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-blue-500/30 text-blue-500 hover:bg-blue-500/5"
                onClick={() => handleRate('good')}
                disabled={reviewing}
              >
                <ThumbsUp className="h-4 w-4 mb-1" />
                <span className="text-xs">Good</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-3 border-green-500/30 text-green-500 hover:bg-green-500/5"
                onClick={() => handleRate('easy')}
                disabled={reviewing}
              >
                <Star className="h-4 w-4 mb-1" />
                <span className="text-xs">Easy</span>
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-4">
            Keyboard: Space to flip, 1-4 to rate
          </p>
        </>
      ) : null}
    </div>
  )
}
