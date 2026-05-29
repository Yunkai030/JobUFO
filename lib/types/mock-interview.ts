export interface MockQuestion {
  question: string
  answer: string | null
  feedback: string | null
  score: number | null
}

export interface MockRound {
  type: 'intro' | 'behavioral' | 'technical' | 'situational' | 'closing'
  title: string
  questions: MockQuestion[]
}

export interface MockReport {
  overall_score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  round_scores: { round: string; score: number; comment: string }[]
}

export interface MockInterview {
  id: string
  user_id: string
  resume_id: string
  company: string
  role: string
  job_description: string | null
  status: 'in_progress' | 'completed'
  current_round: number
  rounds: MockRound[]
  report: MockReport | null
  created_at: string
  updated_at: string
}

export const ROUND_LABELS: Record<string, string> = {
  intro: 'Self Introduction',
  behavioral: 'Behavioral',
  technical: 'Technical',
  situational: 'Situational',
  closing: 'Wrap-up',
}
