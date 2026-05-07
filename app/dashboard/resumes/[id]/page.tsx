import { notFound } from 'next/navigation'
import { getResumeById } from '@/lib/resume/queries'
import { ResumeEditor } from '@/components/resume/resume-editor'

export default async function ResumeEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const resume = await getResumeById(id)
  if (!resume) notFound()

  return <ResumeEditor initial={resume} />
}
