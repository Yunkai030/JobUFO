import Link from 'next/link'
import { getResumes } from '@/lib/resume/queries'
import { createResume } from '@/lib/resume/actions'
import { Button } from '@/components/ui/button'
import { UploadResume } from '@/components/resume/upload-resume'
import { FileText, Plus, ChevronRight } from 'lucide-react'

export default async function ResumesPage() {
  const resumes = await getResumes()

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resumes</h1>
          <p className="text-sm text-muted-foreground">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UploadResume />
          <form action={createResume}>
            <Button type="submit" className="gap-1.5">
              <Plus className="size-4" />
              New
            </Button>
          </form>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="animate-fade-up flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed py-20" style={{ animationDelay: '60ms' }}>
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold">No resumes yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create from scratch or upload a PDF.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UploadResume />
            <form action={createResume}>
              <Button type="submit">Create from scratch</Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="animate-fade-up divide-y rounded-xl border bg-card overflow-hidden" style={{ animationDelay: '60ms' }}>
          {resumes.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/resumes/${r.id}`}
              className="group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-accent/50 hover:pl-6"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.title}</p>
                {r.target_role && (
                  <p className="text-xs text-muted-foreground truncate">{r.target_role}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(r.updated_at).toLocaleDateString()}
              </span>
              <ChevronRight className="size-4 text-muted-foreground/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
