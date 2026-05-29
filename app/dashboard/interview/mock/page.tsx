import Link from 'next/link'
import { getMockInterviews } from '@/lib/mock-interview/actions'
import { buttonVariants } from '@/components/ui/button'
import { MockInterviewCard } from '@/components/mock-interview/mock-interview-card'
import { Plus, Mic } from 'lucide-react'

export default async function MockInterviewListPage() {
  const interviews = await getMockInterviews()

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mock Interviews</h1>
          <p className="text-sm text-muted-foreground">
            {interviews.length} session{interviews.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/interview/mock/new" className={buttonVariants() + ' gap-1.5'}>
          <Plus className="size-4" />
          New
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="animate-fade-up flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed py-20" style={{ animationDelay: '60ms' }}>
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
            <Mic className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold">No interviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start your first mock interview.
            </p>
          </div>
          <Link href="/dashboard/interview/mock/new" className={buttonVariants()}>
            Start Mock Interview
          </Link>
        </div>
      ) : (
        <div className="animate-fade-up divide-y rounded-xl border bg-card overflow-hidden" style={{ animationDelay: '60ms' }}>
          {interviews.map((interview) => (
            <MockInterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  )
}
