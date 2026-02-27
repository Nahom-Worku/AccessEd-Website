export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://accessed-api-gateway.onrender.com/api/v1'

export const COURSE_COLORS = [
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Amber', hex: '#D97706' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Forest', hex: '#15803D' },
  { name: 'Pink', hex: '#DB2777' },
  { name: 'Cyan', hex: '#0891B2' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Olive', hex: '#4D7C0F' },
  { name: 'Fuchsia', hex: '#A21CAF' },
  { name: 'Slate', hex: '#475569' },
] as const

export const TIER_LIMITS = {
  explorer: {
    documents: 10,
    questions: 50,
    quizzes: 10,
    pages_per_doc: 30,
  },
  member: {
    documents: 10,
    questions: 50,
    quizzes: 10,
    pages_per_doc: 30,
  },
  pro: {
    documents: Infinity,
    questions: Infinity,
    quizzes: Infinity,
    pages_per_doc: Infinity,
  },
} as const

export const PROFICIENCY_COLORS = {
  mastered: '#22C55E',
  proficient: '#3B82F6',
  learning: '#EAB308',
  struggling: '#EF4444',
  decaying: '#F97316',
  forgotten: '#6B7280',
} as const

export const COURSE_ICONS: Record<string, string> = {
  bio: 'Leaf',
  biology: 'Leaf',
  chem: 'FlaskConical',
  chemistry: 'FlaskConical',
  physics: 'Atom',
  math: 'Calculator',
  calculus: 'Calculator',
  algebra: 'Calculator',
  statistics: 'BarChart3',
  history: 'BookOpen',
  english: 'PenLine',
  literature: 'BookOpen',
  computer: 'Monitor',
  programming: 'Code',
  circuits: 'Zap',
  electrical: 'Zap',
  economics: 'TrendingUp',
  psychology: 'Brain',
  philosophy: 'Lightbulb',
  art: 'Palette',
  music: 'Music',
  language: 'Languages',
  geography: 'Globe',
  law: 'Scale',
  medicine: 'Heart',
  engineering: 'Wrench',
  business: 'Briefcase',
  finance: 'DollarSign',
  accounting: 'Receipt',
} as const

export const TOKEN_KEYS = {
  accessToken: 'accessed_access_token',
  refreshToken: 'accessed_refresh_token',
  user: 'accessed_user',
} as const
