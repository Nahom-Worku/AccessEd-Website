'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trophy, Target, ArrowLeft, RotateCcw, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuizStore } from '@/lib/stores/quiz-store'
import { formatPercentage } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

export default function QuizResultsPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  const router = useRouter()
  const { results, questions, reset } = useQuizStore()

  useEffect(() => {
    if (!results) router.replace(`/courses/${courseId}/quiz`)
  }, [results, courseId, router])

  if (!results) return null

  const percentage = results.accuracy
  const scoreColor = percentage >= 0.8 ? 'text-green-500' : percentage >= 0.6 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
          <Trophy className={`h-10 w-10 ${scoreColor}`} />
        </div>
        <h1 className="text-3xl font-bold mb-1">
          <span className={scoreColor}>{formatPercentage(percentage)}</span>
        </h1>
        <p className="text-muted-foreground">
          {results.correct_count} of {results.total_questions} correct
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-brand" />
            <p className="text-lg font-bold">{results.next_difficulty}</p>
            <p className="text-xs text-muted-foreground">Next difficulty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <RotateCcw className="h-5 w-5 mx-auto mb-1 text-brand" />
            <p className="text-lg font-bold">{results.suggested_focus_areas.length}</p>
            <p className="text-xs text-muted-foreground">Focus areas</p>
          </CardContent>
        </Card>
      </div>

      {/* Question Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {results.results.map((r, i) => {
            const q = questions.find(q => q.question_id === r.question_id)
            return (
              <div key={i} className={cn(
                'p-3 rounded-lg border',
                r.was_correct ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5',
              )}>
                <div className="flex items-start gap-2">
                  {r.was_correct
                    ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{q?.question_text}</p>
                    {!r.was_correct && (
                      <div className="mt-1 text-xs space-y-0.5">
                        <p className="text-red-500">Your answer: {r.user_answer}</p>
                        <p className="text-green-600 dark:text-green-400">Correct: {r.correct_answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href={`/courses/${courseId}`} className="flex-1">
          <Button variant="outline" className="w-full" onClick={() => reset()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course
          </Button>
        </Link>
        <Link href={`/courses/${courseId}/quiz`} className="flex-1">
          <Button className="w-full" onClick={() => reset()}>
            Take another quiz
          </Button>
        </Link>
      </div>
    </div>
  )
}
