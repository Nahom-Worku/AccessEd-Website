'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Trophy, Target, ArrowLeft, RotateCcw, CheckCircle, XCircle,
  MessageSquare, Loader2, ChevronDown, ChevronUp, Plus, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuizStore } from '@/lib/stores/quiz-store'
import { askAboutQuestionStream } from '@/lib/api/chat'
import { createFlashcard } from '@/lib/api/flashcards'
import { formatPercentage } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import type { QuizQuestionResult } from '@/lib/types/quiz'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ─── AI Explanation Panel ───────────────────────────────────────────

function AIExplainer({
  courseId,
  questionResult,
  question,
}: {
  courseId: string
  questionResult: QuizQuestionResult
  question: { question_text: string; subtopic: string; subtopic_display_name: string; difficulty: string; explanation: string; options?: string[]; question_id: string }
}) {
  const [explanation, setExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadExplanation = useCallback(async () => {
    if (hasLoaded || isLoading) return
    setIsLoading(true)
    setExplanation('')

    try {
      let fullContent = ''
      const stream = askAboutQuestionStream({
        course_id: courseId,
        question_context: {
          question_id: question.question_id,
          question_text: question.question_text,
          user_answer: questionResult.user_answer,
          correct_answer: questionResult.correct_answer,
          subtopic: question.subtopic,
          subtopic_display_name: question.subtopic_display_name,
          difficulty: question.difficulty,
          base_explanation: question.explanation,
          options: question.options,
        },
        mode: 'explain',
      })

      for await (const event of stream) {
        const e = event as unknown as Record<string, unknown>
        if (e.type === 'content' && e.content) {
          fullContent += e.content as string
          setExplanation(fullContent)
        } else if (e.response) {
          fullContent = e.response as string
          setExplanation(fullContent)
        }
      }

      if (!fullContent) setExplanation(question.explanation || 'No explanation available.')
      setHasLoaded(true)
    } catch {
      setExplanation(question.explanation || 'Failed to load AI explanation. Here\'s the basic explanation.')
      setHasLoaded(true)
    } finally {
      setIsLoading(false)
    }
  }, [courseId, question, questionResult, hasLoaded, isLoading])

  // Auto-load on mount
  useEffect(() => { loadExplanation() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">AI Explanation</span>
      </div>
      {isLoading && !explanation ? (
        <div className="flex items-center gap-2 text-muted-foreground py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="text-xs">Analyzing your answer...</span>
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

// ─── Question Result Card ───────────────────────────────────────────

function QuestionResultCard({
  result,
  question,
  courseId,
  index,
}: {
  result: QuizQuestionResult
  question: { question_text: string; subtopic: string; subtopic_display_name: string; difficulty: string; explanation: string; options?: string[]; question_id: string } | undefined
  courseId: string
  index: number
}) {
  const [expanded, setExpanded] = useState(!result.was_correct)
  const [creatingFlashcard, setCreatingFlashcard] = useState(false)

  const handleCreateFlashcard = async () => {
    if (!question) return
    setCreatingFlashcard(true)
    try {
      await createFlashcard({
        front: question.question_text,
        back: `${result.correct_answer}\n\n${question.explanation || ''}`,
        course_id: courseId,
        subtopic: question.subtopic,
        subtopic_display_name: question.subtopic_display_name,
        source_type: 'quiz',
        source_question_id: question.question_id,
      })
      toast.success('Flashcard created')
    } catch {
      toast.error('Failed to create flashcard')
    } finally {
      setCreatingFlashcard(false)
    }
  }

  return (
    <div className={cn(
      'rounded-xl border transition-all',
      result.was_correct ? 'border-green-500/20' : 'border-red-500/20',
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          result.was_correct ? 'bg-green-500/10' : 'bg-red-500/10',
        )}>
          {result.was_correct
            ? <CheckCircle className="h-4 w-4 text-green-500" />
            : <XCircle className="h-4 w-4 text-red-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">Q{index + 1}</span>
            {question && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-secondary capitalize">{question.difficulty}</span>
            )}
          </div>
          <p className="text-sm font-medium">{question?.question_text || `Question ${index + 1}`}</p>
          {!result.was_correct && (
            <div className="mt-1.5 text-xs space-y-0.5">
              <p className="text-red-500">Your answer: {result.user_answer}</p>
              <p className="text-green-600 dark:text-green-400">Correct: {result.correct_answer}</p>
            </div>
          )}
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50">
          {/* Explanation */}
          {!result.was_correct && question ? (
            <AIExplainer
              courseId={courseId}
              questionResult={result}
              question={question}
            />
          ) : question?.explanation ? (
            <div className="mt-3 p-3 rounded-lg bg-secondary/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Explanation</p>
              <p className="text-sm">{question.explanation}</p>
            </div>
          ) : null}

          {/* Actions */}
          {!result.was_correct && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateFlashcard}
                disabled={creatingFlashcard}
                className="text-xs h-7"
              >
                {creatingFlashcard ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                Save as flashcard
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Results Page ──────────────────────────────────────────────

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
  const scoreBg = percentage >= 0.8 ? 'bg-green-500/10' : percentage >= 0.6 ? 'bg-yellow-500/10' : 'bg-red-500/10'
  const wrongResults = results.results.filter(r => !r.was_correct)

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Score Header */}
      <div className="text-center mb-8">
        <div className={cn('w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4', scoreBg)}>
          <Trophy className={cn('h-12 w-12', scoreColor)} />
        </div>
        <h1 className="text-4xl font-bold mb-1">
          <span className={scoreColor}>{formatPercentage(percentage)}</span>
        </h1>
        <p className="text-muted-foreground">
          {results.correct_count} of {results.total_questions} correct
        </p>
        {percentage >= 0.8 && (
          <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">Great work!</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-brand" />
            <p className="text-lg font-bold capitalize">{results.next_difficulty}</p>
            <p className="text-xs text-muted-foreground">Next difficulty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <p className="text-lg font-bold">{wrongResults.length}</p>
            <p className="text-xs text-muted-foreground">Mistakes</p>
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

      {/* Focus Areas */}
      {results.suggested_focus_areas.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-brand/5 border border-brand/10">
          <p className="text-xs font-semibold text-brand mb-2 uppercase tracking-wider">Suggested Focus Areas</p>
          <div className="flex flex-wrap gap-2">
            {results.suggested_focus_areas.map((area, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-brand/10 text-brand font-medium">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Question Breakdown */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-3">Question Breakdown</h2>
        <div className="space-y-2">
          {results.results.map((r, i) => {
            const q = questions.find(q => q.question_id === r.question_id)
            return (
              <QuestionResultCard
                key={i}
                result={r}
                question={q}
                courseId={courseId}
                index={i}
              />
            )
          })}
        </div>
      </div>

      {/* Actions */}
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
