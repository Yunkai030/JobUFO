'use client'

import { useTransition } from 'react'
import type { Application, ApplicationStatus } from '@/lib/types/application'
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/lib/types/application'
import { updateApplicationStatus, deleteApplication } from '@/lib/application/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  applications: Application[]
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function ApplicationRow({ app }: { app: Application }) {
  const [pending, startTransition] = useTransition()

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    startTransition(() => updateApplicationStatus(app.id, newStatus))
  }

  const handleDelete = () => {
    if (!confirm(`Delete application for ${app.role} at ${app.company}?`)) return
    startTransition(() => deleteApplication(app.id))
  }

  return (
    <Card className={pending ? 'opacity-50' : ''}>
      <CardContent className="flex items-center gap-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{app.role}</span>
            <span className="text-muted-foreground">at</span>
            <span className="font-medium truncate">{app.company}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {app.channel && <span>{app.channel}</span>}
            {app.location && <span>{app.location}</span>}
            {app.salary_range && <span>{app.salary_range}</span>}
            <span>{new Date(app.applied_at).toLocaleDateString()}</span>
          </div>
          {app.notes && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{app.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={app.status}
            onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
            className="h-7 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <StatusBadge status={app.status} />
          <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ApplicationList({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No applications yet. Start tracking your job applications!
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-2">
      {applications.map((app) => (
        <ApplicationRow key={app.id} app={app} />
      ))}
    </div>
  )
}
