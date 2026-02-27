export interface Course {
  id: string
  user_id: string
  name: string
  color?: string
  is_default: boolean
  is_general: boolean
  exam_date?: string
  exam_name?: string
  created_at: string
  updated_at: string
}

export interface CourseCreate {
  user_id: string
  name: string
}

export interface CourseUpdate {
  name?: string
  color?: string
  exam_date?: string
  exam_name?: string
}
