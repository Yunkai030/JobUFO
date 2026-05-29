export interface InterviewQuestion {
  type: 'behavioral' | 'technical' | 'situational'
  question: string
  why: string
  tips: string[]
  sample_framework: string
}

export interface InterviewPrep {
  id: string
  user_id: string
  resume_id: string
  job_title: string | null
  company: string | null
  job_description: string
  questions: InterviewQuestion[]
  created_at: string
}
