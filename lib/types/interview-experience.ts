export type ExperienceLanguage = 'en' | 'zh'
export type ExperienceOutcome = 'offer' | 'rejected' | 'pending'

/** AI-extracted essence of a single submitted experience. */
export interface ExperienceSummary {
  format: string // one-line description of the interview format
  rounds: string[] // e.g. ["Phone screen", "2x technical", "System design"]
  questions: string[] // notable questions asked
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string[]
}

export interface InterviewExperience {
  id: string
  user_id: string
  company: string
  company_key: string
  role: string | null
  language: ExperienceLanguage
  outcome: ExperienceOutcome | null
  content: string
  ai_summary: ExperienceSummary | null
  created_at: string
}

/** AI synthesis across all experiences for a company. */
export interface CompanyInsightSummary {
  overview: string
  rounds: string[]
  common_questions: string[]
  tips: string[]
}

export interface CompanyInsight {
  company_key: string
  language: ExperienceLanguage
  company: string
  summary: CompanyInsightSummary
  source_count: number
  updated_at: string
}

export interface CompanyListItem {
  company: string
  company_key: string
  count: number
}

export const OUTCOME_LABELS: Record<ExperienceOutcome, string> = {
  offer: 'Offer',
  rejected: 'Rejected',
  pending: 'Pending',
}
