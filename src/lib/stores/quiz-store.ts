import { create } from 'zustand'
import type { QuizQuestion, QuizAnswer, QuizResultResponse } from '@/lib/types/quiz'

interface QuizState {
  quizId: string | null
  questions: QuizQuestion[]
  currentIndex: number
  answers: QuizAnswer[]
  startTime: number | null
  questionStartTime: number | null
  results: QuizResultResponse | null
  isSubmitting: boolean

  startQuiz: (quizId: string, questions: QuizQuestion[]) => void
  answerQuestion: (questionId: string, answer: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  goToQuestion: (index: number) => void
  setResults: (results: QuizResultResponse) => void
  setSubmitting: (submitting: boolean) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  quizId: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  startTime: null,
  questionStartTime: null,
  results: null,
  isSubmitting: false,

  startQuiz: (quizId, questions) => set({
    quizId,
    questions,
    currentIndex: 0,
    answers: [],
    startTime: Date.now(),
    questionStartTime: Date.now(),
    results: null,
    isSubmitting: false,
  }),

  answerQuestion: (questionId, answer) => {
    const { answers, questionStartTime } = get()
    const timeSpent = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0
    const existing = answers.findIndex(a => a.question_id === questionId)
    const newAnswer: QuizAnswer = { question_id: questionId, user_answer: answer, time_spent_seconds: timeSpent }

    set({
      answers: existing >= 0
        ? answers.map((a, i) => i === existing ? newAnswer : a)
        : [...answers, newAnswer],
    })
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get()
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, questionStartTime: Date.now() })
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, questionStartTime: Date.now() })
    }
  },

  goToQuestion: (index) => set({ currentIndex: index, questionStartTime: Date.now() }),

  setResults: (results) => set({ results }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  reset: () => set({
    quizId: null,
    questions: [],
    currentIndex: 0,
    answers: [],
    startTime: null,
    questionStartTime: null,
    results: null,
    isSubmitting: false,
  }),
}))
