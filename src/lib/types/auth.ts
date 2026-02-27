export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  role: string
  is_active?: boolean
  email_verified: boolean
  has_completed_onboarding: boolean
  data_migrated?: boolean
  created_at?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  full_name?: string
}

export interface RefreshRequest {
  refresh_token: string
}

export interface UsageStatus {
  tier: UserTier
  tier_display: string
  documents_used: number
  documents_limit: number
  documents_remaining: number
  questions_used: number
  questions_limit: number
  questions_remaining: number
  questions_period: string
  questions_resets_in_hours: number
  quizzes_used: number
  quizzes_limit: number
  quizzes_remaining: number
  quizzes_period: string
  quizzes_resets_in_hours: number
  emergency_questions_used: number
  emergency_questions_limit: number
  emergency_questions_remaining: number
  explorer_expires_in_hours: number
  explorer_expires_formatted?: string
  can_upgrade: boolean
  upgrade_benefits: string[]
  features: Record<string, boolean>
}

export type UserTier = 'explorer' | 'member' | 'pro'
