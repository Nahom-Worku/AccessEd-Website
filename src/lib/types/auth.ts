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

export interface UsageLimits {
  documents_uploaded: number
  documents_limit: number
  questions_asked: number
  questions_limit: number
  quizzes_generated: number
  quizzes_limit: number
  email_verified: boolean
}

export type UserTier = 'explorer' | 'member' | 'pro'
