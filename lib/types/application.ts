export const APPLICATION_STATUSES = [
  'applied',
  'screening',
  'phone',
  'interview',
  'final',
  'offer',
  'rejected',
  'withdrawn',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screening: 'Screening',
  phone: 'Phone Screen',
  interview: 'Interview',
  final: 'Final Round',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  screening: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  phone: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  interview: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  final: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  offer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  withdrawn: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

export interface Application {
  id: string
  user_id: string
  resume_id: string | null
  company: string
  role: string
  url: string | null
  channel: string | null
  location: string | null
  salary_range: string | null
  status: ApplicationStatus
  notes: string | null
  applied_at: string
  updated_at: string
}
