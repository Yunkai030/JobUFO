import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMockInterview } from '@/lib/mock-interview/actions'
import { MockSession } from '@/components/mock-interview/mock-session'

export default async function MockInterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const interview = await getMockInterview(id)
  if (!interview) notFound()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/interview/mock" className="transition-colors hover:text-foreground">
          Practice sessions
        </Link>
        <span>/</span>
        <span className="text-foreground">
          {interview.role} at {interview.company}
        </span>
      </div>

      <MockSession interview={interview} />
    </div>
  )
}
