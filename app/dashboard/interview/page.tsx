import Link from 'next/link'
import { getResumes } from '@/lib/resume/queries'
import { getInterviewPreps } from '@/lib/interview/actions'
import { getMockInterviews } from '@/lib/mock-interview/actions'
import { InterviewPrepForm } from '@/components/interview/interview-prep-form'
import { Mic, ArrowRight } from 'lucide-react'

export default async function InterviewPage() {
  const [resumes, preps, mockInterviews] = await Promise.all([
    getResumes(),
    getInterviewPreps(),
    getMockInterviews(),
  ])

  const inProgressCount = mockInterviews.filter((m) => m.status === 'in_progress').length
  const completedCount = mockInterviews.filter((m) => m.status === 'completed').length

  return (
    <div className="max-w-3xl space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Interview Prep</h1>
        <p className="text-sm text-muted-foreground">
          Practice and prepare for interviews
        </p>
      </div>

      {/* Mock Interview dark CTA */}
      <div className="glow-border animate-fade-up rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 p-6 text-background">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-background/15">
              <Mic className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Mock Interview Agent</h2>
              <p className="mt-0.5 text-sm opacity-70">
                5 structured rounds with real-time AI feedback and scoring
              </p>
              {(inProgressCount > 0 || completedCount > 0) && (
                <p className="mt-2 text-xs opacity-50">
                  {inProgressCount > 0 && `${inProgressCount} in progress`}
                  {inProgressCount > 0 && completedCount > 0 && ' · '}
                  {completedCount > 0 && `${completedCount} completed`}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href="/dashboard/interview/mock/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-background px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              Start
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/dashboard/interview/mock"
              className="inline-flex items-center justify-center rounded-lg border border-background/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-background/10"
            >
              History
            </Link>
          </div>
        </div>
      </div>

      <InterviewPrepForm resumes={resumes} initialPreps={preps} />
    </div>
  )
}
