import Link from 'next/link'
import { getMockInterviews } from '@/lib/mock-interview/actions'
import { MockInterviewCard } from '@/components/mock-interview/mock-interview-card'
import { buttonVariants } from '@/components/ui/button'
import { Camera, Plus } from 'lucide-react'

export default async function MockInterviewListPage() {
  const interviews = await getMockInterviews()

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Practice sessions</h1>
          <p className="text-sm text-muted-foreground">
            Review your camera-on interview practice.
          </p>
        </div>
        <Link href="/dashboard/interview/mock/new" className={buttonVariants() + ' gap-1.5'}>
          <Plus className="size-4" />
          New
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed py-20">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
            <Camera className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold">No practice sessions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with one realistic camera-on rehearsal.
            </p>
          </div>
          <Link href="/dashboard/interview/mock/new" className={buttonVariants()}>
            Start practice
          </Link>
        </div>
      ) : (
        <div className="divide-y overflow-hidden rounded-xl border bg-card">
          {interviews.map((interview) => (
            <MockInterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  )
}
