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
import { Briefcase, Trash2 } from 'lucide-react'

interface Props {
  applications: Application[]
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${STATUS_COLORS[status]}`}>
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
    <div className={`group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-accent/50 hover:pl-6 ${pending ? 'opacity-50' : ''}`}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent transition-colors">
        <Briefcase className="size-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{app.role}</span>
          <span className="text-muted-foreground text-sm">at</span>
          <span className="font-medium truncate">{app.company}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {app.channel && <span>{app.channel}</span>}
          {app.location && <span>{app.location}</span>}
          {app.salary_range && <span>{app.salary_range}</span>}
          <span>{new Date(app.applied_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <select
          value={app.status}
          onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
          className="h-7 rounded-lg border border-input bg-transparent px-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <StatusBadge status={app.status} />
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function ApplicationList({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-16">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent">
          <Briefcase className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No applications yet. Start tracking your job applications!
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y rounded-xl border bg-card overflow-hidden">
      {applications.map((app) => (
        <ApplicationRow key={app.id} app={app} />
      ))}
    </div>
  )
}
