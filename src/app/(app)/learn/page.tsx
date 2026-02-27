'use client'

import Link from 'next/link'
import { BookOpen, AlertTriangle, BarChart3, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LearnPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Learning Hub</h1>
      <p className="text-muted-foreground mb-8">Review mistakes, practice weak topics, and track your mastery.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/learn/mistakes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Mistake Journal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review every wrong answer, grouped by topic. Turn weaknesses into strengths.
              </p>
              <Button variant="ghost" size="sm" className="-ml-3 text-brand">
                Open journal <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/learn/practice">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Practice Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Flashcard-style practice focused on your most common mistakes.
              </p>
              <Button variant="ghost" size="sm" className="-ml-3 text-brand">
                Start practice <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/progress" className="md:col-span-2">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Progress Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See your study streak, activity heatmap, XP progress, and mastery levels across all courses.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
