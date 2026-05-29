import { getResumes } from '@/lib/resume/queries'
import { StartMockForm } from '@/components/mock-interview/start-mock-form'
import Link from 'next/link'

export default async function NewMockInterviewPage() {
  const resumes = await getResumes()

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/interview/mock" className="hover:text-foreground transition-colors">
          Mock Interviews
        </Link>
        <span>/</span>
        <span className="text-foreground">New</span>
      </div>

      <StartMockForm resumes={resumes} />
    </div>
  )
}
