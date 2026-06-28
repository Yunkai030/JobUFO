import { getResumes } from '@/lib/resume/queries'
import { StartMockForm } from '@/components/mock-interview/start-mock-form'
import Link from 'next/link'

export default async function NewMockInterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>
}) {
  const [resumes, { company }] = await Promise.all([getResumes(), searchParams])

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/interview/mock" className="hover:text-foreground transition-colors">
          Mock Interviews
        </Link>
        <span>/</span>
        <span className="text-foreground">New</span>
      </div>

      <StartMockForm resumes={resumes} defaultCompany={company ?? ''} />
    </div>
  )
}
