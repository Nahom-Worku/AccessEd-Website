export interface AdminOverview {
  total_users: number
  pro_users: number
  new_users_7d: number
  total_documents: number
  total_courses: number
  total_questions: number
  total_quizzes: number
}

export interface TierBreakdown {
  tier: string
  count: number
  percentage: number
}

export interface SignupMethod {
  method: string
  count: number
}

export interface RecentSignup {
  date: string
  signups: number
}

export interface ProSubscriber {
  email: string
  signup_date: string
}

export interface UserActivity {
  email: string
  tier: string
  signup_type: string
  joined: string
  courses: number
  docs: number
  questions: number
  quizzes: number
  total_activity: number
  status: string
}

export interface EngagementBreakdown {
  status: string
  users: number
  percentage: number
}

export interface AdminAnalytics {
  status: string
  overview: AdminOverview
  users_by_tier: TierBreakdown[]
  signup_methods: SignupMethod[]
  recent_signups: RecentSignup[]
  pro_subscribers: ProSubscriber[]
  users_activity: UserActivity[]
  engagement_breakdown: EngagementBreakdown[]
}

export interface Announcement {
  id: string
  type: 'info' | 'warning' | 'maintenance' | 'critical'
  title: string
  message: string
  dismissible: boolean
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface AnnouncementCreate {
  type: string
  title: string
  message: string
  dismissible: boolean
  starts_at?: string
  expires_at?: string
}

export interface AnnouncementUpdate {
  type?: string
  title?: string
  message?: string
  dismissible?: boolean
  is_active?: boolean
  starts_at?: string
  expires_at?: string
}
