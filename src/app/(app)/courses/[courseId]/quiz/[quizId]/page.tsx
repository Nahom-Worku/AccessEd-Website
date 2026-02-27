'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useQuizStore } from '@/lib/stores/quiz-store'
import { submitQuiz } from '@/lib/api/quizzes'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export default function QuizTakingPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params)
  const router = useRouter()
  const {
    questions, currentIndex, answers, startTime, quizId: storeQuizId,
    answerQuestion, nextQuestion, prevQuestion, setResults, setSubmitting, isSubmitting,
  } = useQuizStore()
  const [selectedAnswer, setSelectedAnswer] = useState('')

  const question = questions[currentIndex]
  const existingAnswer = answers.find(a => a.question_id === question?.question_id)
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  useEffect(() => {
    if (!storeQuizId || questions.length === 0) {
      router.replace(`/courses/${courseId}/quiz`)
    }
  }, [storeQuizId, questions, courseId, router])

  useEffect(() => {
    setSelectedAnswer(existingAnswer?.user_answer || '')
  }, [currentIndex, existingAnswer])

  if (!question) return null

  const handleSelect = (answer: string) => {
    setSelectedAnswer(answer)
    answerQuestion(question.question_id, answer)
  }

  const handleSubmit = async () => {
    if (answers.length < questions.length) {
      toast.error(`Answer all ${questions.length} questions before submitting`)
      return
    }
    setSubmitting(true)
    try {
      const results = await submitQuiz(quizId, { answers })
      setResults(results)
      router.push(`/courses/${courseId}/quiz/results`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary capitalize">
              {question.difficulty}
            </span>
            <span className="text-xs text-muted-foreground">{question.subtopic_display_name}</span>
          </div>
          <p className="text-base font-medium leading-relaxed">{question.question_text}</p>
        </CardContent>
      </Card>

      {/* Answer Options */}
      <div className="space-y-2 mb-6">
        {question.question_type === 'multiple_choice' || question.question_type === 'true_false' ? (
          (question.options || []).map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border transition-all text-sm',
                selectedAnswer === option
                  ? 'border-brand bg-brand/5 text-foreground'
                  : 'border-border hover:border-muted-foreground/30 text-foreground',
              )}
            >
              {option}
            </button>
          ))
        ) : (
          <textarea
            value={selectedAnswer}
            onChange={(e) => handleSelect(e.target.value)}
            placeholder="Type your answer..."
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm resize-none h-24 outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || answers.length < questions.length}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
