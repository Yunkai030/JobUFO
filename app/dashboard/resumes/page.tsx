import Link from 'next/link'
import { getResumes } from '@/lib/resume/queries'
import { createResume } from '@/lib/resume/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadResume } from '@/components/resume/upload-resume'

export default async function ResumesPage() {
  const resumes = await getResumes()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Resumes</h1>
        <div className="flex items-center gap-2">
          <UploadResume />
          <form action={createResume}>
            <Button type="submit">+ New resume</Button>
          </form>
        </div>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t created any resumes yet.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <UploadResume />
              <form action={createResume}>
                <Button type="submit">Create from scratch</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {resumes.map((r) => (
            <Link key={r.id} href={`/dashboard/resumes/${r.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{r.title}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.target_role && (
                    <p className="text-sm text-muted-foreground">{r.target_role}</p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
