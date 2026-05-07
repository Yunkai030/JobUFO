import { getApplications } from '@/lib/application/actions'
import { AddApplicationForm } from '@/components/tracker/add-application-form'
import { ApplicationList } from '@/components/tracker/application-list'
import { SankeyChart } from '@/components/tracker/sankey-chart'

export default async function TrackerPage() {
  const applications = await getApplications()

  const stats = {
    total: applications.length,
    active: applications.filter(
      (a) => !['rejected', 'withdrawn', 'offer'].includes(a.status)
    ).length,
    offers: applications.filter((a) => a.status === 'offer').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Application Tracker</h1>
        <AddApplicationForm />
      </div>

      {/* Stats row */}
      {applications.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} color="text-blue-600" />
          <StatCard label="Offers" value={stats.offers} color="text-green-600" />
          <StatCard label="Rejected" value={stats.rejected} color="text-red-600" />
        </div>
      )}

      {/* Sankey chart */}
      {applications.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">Application Funnel</h2>
          <SankeyChart applications={applications} />
        </div>
      )}

      {/* Application list */}
      <div>
        <h2 className="mb-2 text-lg font-semibold">All Applications</h2>
        <ApplicationList applications={applications} />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className={`text-2xl font-bold ${color ?? ''}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
