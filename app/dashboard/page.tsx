import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getResumes } from '@/lib/resume/queries'
import { getApplications } from '@/lib/application/actions'
import {
  FileText,
  Target,
  Camera,
  BarChart3,
  ArrowRight,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [resumes, applications] = await Promise.all([
    getResumes(),
    getApplications(),
  ])

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const activeApps = applications.filter(
    (a) => !['rejected', 'withdrawn', 'offer'].includes(a.status)
  ).length
  const offers = applications.filter((a) => a.status === 'offer').length

  return (
    <div className="max-w-5xl space-y-8">
      {/* Greeting */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight">
          Hey, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Practice video interviews until the camera feels normal.
        </p>
      </div>

      {/* Bento grid */}
      <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats card - spans 2 cols */}
        <div className="rounded-2xl border bg-card p-6 sm:col-span-2 lg:col-span-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overview</p>
          <div className="mt-4 grid grid-cols-4 gap-6">
            <Stat value={resumes.length} label="Resumes" />
            <Stat value={applications.length} label="Applied" />
            <Stat value={activeApps} label="Active" />
            <Stat value={offers} label="Offers" />
          </div>
          {/* Mini activity bar */}
          <div className="mt-6 flex items-center gap-1">
            {Array.from({ length: 28 }).map((_, i) => {
              const intensity = (i * 7 + applications.length * 3 + resumes.length) % 10
              return (
                <div
                  key={i}
                  className="h-6 flex-1 rounded-sm transition-colors"
                  style={{
                    backgroundColor: intensity > 6
                      ? 'oklch(0.50 0.18 265 / 0.5)'
                      : intensity > 2
                      ? 'oklch(0.50 0.18 265 / 0.15)'
                      : 'oklch(0.50 0.18 265 / 0.04)',
                  }}
                />
              )
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Last 4 weeks of activity</p>
        </div>

        {/* Camera-on interview CTA - dark card */}
        <div className="glow-border rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 p-6 text-background flex flex-col justify-between">
          <div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-background/15">
              <Camera className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold">InterviewMirror</h3>
            <p className="mt-1 text-sm leading-relaxed opacity-60">
              Turn on your camera, answer realistic questions, and learn where you freeze.
            </p>
          </div>
          <Link
            href="/dashboard/interview/mock/new"
            className="group mt-5 inline-flex items-center gap-1.5 rounded-lg bg-background/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-background/25 self-start"
          >
            Start practice
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Quick actions row */}
        <ActionCard
          icon={Target}
          title="ATS Check"
          desc="Score resume match"
          href="/dashboard/ats"
        />
        <ActionCard
          icon={FileText}
          title="New Resume"
          desc="Build or upload"
          href="/dashboard/resumes"
        />
        <ActionCard
          icon={BarChart3}
          title="Track"
          desc="Log an application"
          href="/dashboard/tracker"
        />
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-lg hover:shadow-foreground/[0.03] hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent transition-all duration-200 group-hover:bg-foreground group-hover:text-background group-hover:scale-105">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  )
}
