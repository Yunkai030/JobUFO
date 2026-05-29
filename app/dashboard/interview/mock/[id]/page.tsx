import { notFound } from 'next/navigation'
import { getMockInterview } from '@/lib/mock-interview/actions'
import { MockSession } from '@/components/mock-interview/mock-session'
import Link from 'next/link'

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
      <div className="mx-auto max-w-3xl flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/interview/mock" className="hover:text-foreground transition-colors">
          Mock Interviews
        </Link>
        <span>/</span>
        <span className="text-foreground">
          {interview.role} @ {interview.company}
        </span>
      </div>

      <MockSession interview={interview} />
    </div>
  )
}
