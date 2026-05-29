import { getApplications } from '@/lib/application/actions'
import { AddApplicationForm } from '@/components/tracker/add-application-form'
import { ApplicationList } from '@/components/tracker/application-list'
import { SankeyChart } from '@/components/tracker/sankey-chart'

export default async function TrackerPage() {
  const applications = await getApplications()

  const stats = [
    { label: 'Total', value: applications.length },
    {
      label: 'Active',
      value: applications.filter(
        (a) => !['rejected', 'withdrawn', 'offer'].includes(a.status)
      ).length,
    },
    { label: 'Offers', value: applications.filter((a) => a.status === 'offer').length },
    { label: 'Rejected', value: applications.filter((a) => a.status === 'rejected').length },
  ]

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track your job applications
          </p>
        </div>
        <AddApplicationForm />
      </div>

      {applications.length > 0 && (
        <div className="animate-fade-up grid grid-cols-2 gap-px rounded-2xl bg-border overflow-hidden sm:grid-cols-4" style={{ animationDelay: '60ms' }}>
          {stats.map((s, i) => (
            <div key={s.label} className="bg-card p-5">
              <p
                className="animate-count-pop text-3xl font-bold tracking-tight"
                style={{ animationDelay: `${i * 80 + 150}ms` }}
              >
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {applications.length > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h2 className="mb-3 text-lg font-semibold">Funnel</h2>
          <SankeyChart applications={applications} />
        </div>
      )}

      <div className="animate-fade-up" style={{ animationDelay: '180ms' }}>
        <h2 className="mb-3 text-lg font-semibold">All Applications</h2>
        <ApplicationList applications={applications} />
      </div>
    </div>
  )
}
