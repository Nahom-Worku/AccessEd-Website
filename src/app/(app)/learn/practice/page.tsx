'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PracticePage() {
  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/learn">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-xl font-bold">Practice Mode</h1>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">Practice from your mistakes</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Flashcard-style practice generated from your mistake journal. Get questions wrong in quizzes first, then practice them here.
          </p>
          <Link href="/learn/mistakes">
            <Button variant="outline">View Mistake Journal</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
