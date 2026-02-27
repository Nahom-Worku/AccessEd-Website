export interface StreakResponse {
  current_streak: number
  longest_streak: number
  streak_at_risk: boolean
  last_activity_date?: string
  streak_started_at?: string
  days_until_streak_lost?: number
  next_milestone?: number
  days_to_milestone?: number
  streak_shields: number
}

export interface StreakCalendarDay {
  date: string
  had_activity: boolean
  interaction_count: number
  topics_practiced: number
}

export interface StreakCalendarResponse {
  days: StreakCalendarDay[]
  total_active_days: number
  current_streak: number
}

export interface RecordActivityRequest {
  activity_type: 'quiz' | 'flashcard' | 'question' | 'reading'
  topics_count?: number
  xp_earned?: number
  metadata?: Record<string, unknown>
}

export interface RecordActivityResponse {
  success: boolean
  new_streak: number
  streak_increased: boolean
  milestone_reached?: number
  xp_awarded: number
}

export interface XPStats {
  total_xp: number
  daily_xp: number
  weekly_xp: number
  level: number
  xp_to_next_level: number
  level_progress_percent: number
}
