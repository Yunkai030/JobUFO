import Link from 'next/link'
import { getResumes } from '@/lib/resume/queries'
import { StartMockForm } from '@/components/mock-interview/start-mock-form'

export default async function NewMockInterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>
}) {
  const [resumes, { company }] = await Promise.all([getResumes(), searchParams])

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/interview" className="transition-colors hover:text-foreground">
          Practice
        </Link>
        <span>/</span>
        <span className="text-foreground">New camera-on session</span>
      </div>

      <StartMockForm resumes={resumes} defaultCompany={company ?? ''} />
    </div>
  )
}
