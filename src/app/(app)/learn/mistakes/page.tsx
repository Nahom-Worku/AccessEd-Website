'use client'

import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading-skeleton'
import { getMistakePatterns } from '@/lib/api/mistakes'
import { useQuery } from '@tanstack/react-query'

export default function MistakeJournalPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['mistakes', 'patterns'],
    queryFn: () => getMistakePatterns({ include_questions: true }),
  })

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/learn">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Mistake Journal</h1>
          <p className="text-xs text-muted-foreground">
            {data?.summary.total_patterns || 0} patterns &middot; {data?.summary.total_cards_remaining || 0} cards remaining
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : data?.patterns && data.patterns.length > 0 ? (
        <div className="space-y-3">
          {data.patterns.map((pattern, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{pattern.subtopic_display_name || pattern.subtopic}</h3>
                    <p className="text-xs text-muted-foreground">{pattern.parent_topic} &middot; {pattern.course_name}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-500">
                    {pattern.cards_remaining} due
                  </span>
                </div>
                {pattern.questions.slice(0, 2).map((q, j) => (
                  <div key={j} className="text-xs text-muted-foreground mt-2 pl-3 border-l-2 border-red-500/20">
                    <p className="font-medium text-foreground">{q.question_text}</p>
                    <p className="mt-0.5">Correct: {q.correct_answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title="No mistakes yet"
          description="Take some quizzes to build your mistake journal. Every wrong answer is an opportunity to learn."
        />
      )}
    </div>
  )
}
