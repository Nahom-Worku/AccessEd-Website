'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useCourse } from '@/lib/hooks/use-courses'
import { useQuizStore } from '@/lib/stores/quiz-store'
import { generateQuiz } from '@/lib/api/quizzes'
import type { Difficulty } from '@/lib/types/quiz'
import { toast } from 'sonner'

export default function QuizSetupPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  const router = useRouter()
  const { data: course } = useCourse(courseId)
  const { startQuiz } = useQuizStore()
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return }
    setLoading(true)
    try {
      const quiz = await generateQuiz({
        course_id: courseId,
        parent_topic: topic.trim(),
        difficulty,
        count,
      })
      startQuiz(quiz.quiz_id, quiz.questions)
      router.push(`/courses/${courseId}/quiz/${quiz.quiz_id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const color = course?.color || '#2563EB'

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-xl font-bold">Generate Quiz</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Topic</Label>
            <Input
              placeholder="e.g. Cell Biology, Recursion..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <Button
                  key={d}
                  variant={difficulty === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficulty(d)}
                  className="capitalize"
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Number of questions</Label>
            <Input
              type="number"
              min={3}
              max={20}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 10)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            style={{ backgroundColor: color }}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Zap className="mr-2 h-4 w-4" />Generate Quiz</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
