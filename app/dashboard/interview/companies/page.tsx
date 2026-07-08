import Link from 'next/link'
import { getCompanies } from '@/lib/interview-experience/actions'
import { SubmitExperienceForm } from '@/components/interview-experience/submit-experience-form'
import { Building2, ChevronRight, Users } from 'lucide-react'

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Insights</h1>
          <p className="text-sm text-muted-foreground">
            Real interview experiences, distilled by AI. Browse a company or share your own.
          </p>
        </div>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
        <SubmitExperienceForm />
      </div>

      {companies.length === 0 ? (
        <div className="animate-fade-up flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-16" style={{ animationDelay: '120ms' }}>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent">
            <Building2 className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No experiences yet. Be the first to share one — it powers company-flavored practice sessions.
          </p>
        </div>
      ) : (
        <div className="animate-fade-up divide-y rounded-xl border bg-card overflow-hidden" style={{ animationDelay: '120ms' }}>
          {companies.map((c) => (
            <Link
              key={c.company_key}
              href={`/dashboard/interview/companies/${encodeURIComponent(c.company_key)}`}
              className="group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-accent/50 hover:pl-6"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                <Building2 className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate capitalize">{c.company}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  {c.count} experience{c.count !== 1 ? 's' : ''}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
