'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, BookOpen, Loader2, CheckCircle, XCircle, RotateCw,
  ThumbsDown, ThumbsUp, Star, Trophy, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMistakePatterns, generatePracticeQuiz, recordPracticeResults } from '@/lib/api/mistakes'
import { recordActivity } from '@/lib/api/engagement'
import type { PracticeResult } from '@/lib/types/mistakes'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

type PracticeQuestion = {
  question_hash: string
  question_text: string
  question_type: string
  correct_answer: string
  options?: string[]
  explanation: string
  subtopic_display_name?: string
  difficulty: string
}

export default function PracticePage() {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'select' | 'practice' | 'complete'>('select')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<PracticeResult[]>([])
  const [loading, setLoading] = useState(false)

  const { data: mistakes, isLoading: mistakesLoading } = useQuery({
    queryKey: ['mistakes', 'patterns'],
    queryFn: () => getMistakePatterns({ include_questions: true }),
  })

  const courseOptions = useMemo(() => {
    if (!mistakes?.patterns) return []
    const courses = new Map<string, string>()
    for (const p of mistakes.patterns) {
      if (p.course_id && p.course_name) {
        courses.set(p.course_id, p.course_name)
      }
    }
    return Array.from(courses, ([id, name]) => ({ id, name }))
  }, [mistakes])

  const handleStartPractice = async () => {
    setLoading(true)
    try {
      const quiz = await generatePracticeQuiz({
        course_id: selectedCourse || undefined,
        limit: 10,
      }) as { questions?: PracticeQuestion[] }
      const qs = quiz?.questions || []
      if (qs.length === 0) {
        toast.error('No practice questions available')
        return
      }
      setQuestions(qs)
      setCurrentIndex(0)
      setResults([])
      setMode('practice')
    } catch {
      toast.error('Failed to generate practice quiz')
    } finally {
      setLoading(false)
    }
  }

  const currentQ = questions[currentIndex]

  const handleAnswer = useCallback(() => {
    if (!currentQ || !selectedAnswer) return
    const isCorrect = selectedAnswer.toLowerCase().trim() === currentQ.correct_answer.toLowerCase().trim()
    const rating = isCorrect ? 'good' : 'again'
    setResults(prev => [...prev, { question_hash: currentQ.question_hash, rating }])
    setShowResult(true)
  }, [currentQ, selectedAnswer])

  const handleNext = useCallback(async () => {
    setShowResult(false)
    setSelectedAnswer('')
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Submit results
      setMode('complete')
      try {
        await recordPracticeResults(results)
        await recordActivity({ activity_type: 'quiz', topics_count: questions.length })
        queryClient.invalidateQueries({ queryKey: ['mistakes'] })
      } catch { /* silent */ }
    }
  }, [currentIndex, questions.length, results, queryClient])

  const correctCount = results.filter(r => r.rating !== 'again').length

  if (mode === 'complete') {
    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Practice Complete!</h1>
          <p className="text-muted-foreground mb-2">
            {correctCount} of {questions.length} correct
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Incorrect answers will be rescheduled for future practice.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/learn">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Learning Hub
              </Button>
            </Link>
            <Button onClick={() => { setMode('select'); setQuestions([]); setResults([]) }}>
              <RotateCw className="h-4 w-4 mr-2" />
              Practice again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'practice' && currentQ) {
    const progress = ((currentIndex + 1) / questions.length) * 100
    const isCorrect = showResult && selectedAnswer.toLowerCase().trim() === currentQ.correct_answer.toLowerCase().trim()

    return (
      <div className="p-6 lg:p-8 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setMode('select')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Practice</h1>
            <p className="text-xs text-muted-foreground">{currentIndex + 1} of {questions.length}</p>
          </div>
        </div>

        <Progress value={progress} className="h-1.5 mb-6" />

        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded bg-secondary capitalize">{currentQ.difficulty}</span>
              {currentQ.subtopic_display_name && (
                <span className="text-xs text-muted-foreground">{currentQ.subtopic_display_name}</span>
              )}
            </div>
            <p className="text-base font-medium leading-relaxed">{currentQ.question_text}</p>
          </CardContent>
        </Card>

        <div className="space-y-2 mb-4">
          {currentQ.options?.map((option, i) => (
            <button
              key={i}
              onClick={() => { if (!showResult) setSelectedAnswer(option) }}
              disabled={showResult}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border transition-all text-sm',
                showResult && option === currentQ.correct_answer && 'border-green-500 bg-green-500/5',
                showResult && selectedAnswer === option && option !== currentQ.correct_answer && 'border-red-500 bg-red-500/5',
                !showResult && selectedAnswer === option && 'border-brand bg-brand/5',
                !showResult && selectedAnswer !== option && 'border-border hover:border-muted-foreground/30',
              )}
            >
              <div className="flex items-center gap-2">
                {showResult && option === currentQ.correct_answer && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                {showResult && selectedAnswer === option && option !== currentQ.correct_answer && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {showResult && (
          <div className={cn(
            'p-3 rounded-lg mb-4 text-sm',
            isCorrect ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20',
          )}>
            {isCorrect ? (
              <p className="text-green-600 dark:text-green-400 font-medium">Correct!</p>
            ) : (
              <p className="text-red-600 dark:text-red-400 font-medium">
                Incorrect. The answer is: {currentQ.correct_answer}
              </p>
            )}
            {currentQ.explanation && (
              <p className="text-xs text-muted-foreground mt-1">{currentQ.explanation}</p>
            )}
          </div>
        )}

        {!showResult ? (
          <Button onClick={handleAnswer} disabled={!selectedAnswer} className="w-full">
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full">
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    )
  }

  // Selection screen
  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/learn">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Practice Mode</h1>
          <p className="text-xs text-muted-foreground">Practice questions from your mistakes</p>
        </div>
      </div>

      {mistakesLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : !mistakes?.patterns?.length ? (
        <EmptyState
          icon={BookOpen}
          title="No mistakes to practice"
          description="Take quizzes first to build your mistake journal. Wrong answers become practice questions."
        />
      ) : (
        <>
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">Filter by course (optional)</p>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full text-sm bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All courses</option>
                {courseOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground mb-4">
            {mistakes.summary.total_cards_remaining} questions available from {mistakes.summary.total_patterns} weak topics
          </div>

          <Button onClick={handleStartPractice} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
            Start Practice
          </Button>
        </>
      )}
    </div>
  )
}
