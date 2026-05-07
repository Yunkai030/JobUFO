export interface ATSResult {
  id: string
  resume_id: string
  user_id: string
  job_title: string | null
  company: string | null
  job_description: string
  overall_score: number
  keyword_score: number
  experience_score: number
  achievement_score: number
  format_score: number
  matched_keywords: string[]
  missing_keywords: string[]
  suggestions: ATSSuggestion[]
  created_at: string
}

export interface ATSSuggestion {
  section: string
  text: string
  priority: 'high' | 'medium' | 'low'
}

export interface ATSAnalysis {
  overall_score: number
  keyword_score: number
  experience_score: number
  achievement_score: number
  format_score: number
  matched_keywords: string[]
  missing_keywords: string[]
  suggestions: ATSSuggestion[]
  job_title: string
  company: string
}
