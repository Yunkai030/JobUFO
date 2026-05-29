import { notFound } from 'next/navigation'
import { isAdmin } from '@/lib/analytics/admin'
import { getAnalyticsSummary, type DayCount } from '@/lib/analytics/queries'
import { Users, UserPlus, CreditCard, Activity } from 'lucide-react'

const EVENT_LABELS: Record<string, string> = {
  app_opened: 'App opened',
  user_signed_up: 'Signups',
  user_logged_in: 'Logins',
  resume_created: 'Resumes created',
  pdf_exported: 'PDF exports',
  ats_check_run: 'ATS checks',
  interview_prep_generated: 'Interview preps',
  mock_interview_started: 'Mock started',
  mock_interview_completed: 'Mock completed',
  application_created: 'Applications added',
  application_status_changed: 'Status changes',
  checkout_started: 'Checkout started',
  subscription_activated: 'Became Pro',
  subscription_cancelled: 'Cancelled',
}

export default async function AnalyticsPage() {
  // Admin-only. Non-admins get a 404 so the route isn't discoverable.
  if (!(await isAdmin())) notFound()

  const a = await getAnalyticsSummary()

  return (
    <div className="max-w-5xl space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Private dashboard · your raw event data</p>
      </div>

      {!a.hasData ? (
        <div className="animate-fade-up flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-20">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent">
            <Activity className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No events yet. Once people use the app, data shows up here.
          </p>
        </div>
      ) : (
        <>
          {/* Top stats */}
          <div className="animate-fade-up grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-4" style={{ animationDelay: '60ms' }}>
            <Stat icon={UserPlus} label="Total signups" value={a.totalSignups} sub={`+${a.signups7d} this week`} />
            <Stat icon={CreditCard} label="Pro conversions" value={a.funnel.becamePro} />
            <Stat icon={Activity} label="Conversion" value={`${a.conversionPct}%`} />
            <Stat icon={Users} label="Total events" value={a.totalEvents} />
          </div>

          {/* DAU + AI calls */}
          <div className="grid gap-4 lg:grid-cols-2">
            <BarCard title="Daily active users" caption="Last 14 days" data={a.dau} accent="oklch(0.50 0.18 265)" delay={120} />
            <BarCard title="AI calls / day" caption="ATS + prep + mock · your Groq usage" data={a.aiCalls} accent="oklch(0.60 0.14 290)" delay={180} />
          </div>

          {/* Funnel */}
          <div className="animate-fade-up rounded-2xl border bg-card p-6" style={{ animationDelay: '240ms' }}>
            <h2 className="text-sm font-semibold">Free → Paid funnel</h2>
            <div className="mt-5 space-y-3">
              <FunnelRow label="Signed up" value={a.funnel.signedUp} max={a.funnel.signedUp} />
              <FunnelRow label="Started checkout" value={a.funnel.startedCheckout} max={a.funnel.signedUp} />
              <FunnelRow label="Became Pro" value={a.funnel.becamePro} max={a.funnel.signedUp} />
            </div>
          </div>

          {/* Feature usage */}
          <div className="animate-fade-up rounded-2xl border bg-card p-6" style={{ animationDelay: '300ms' }}>
            <h2 className="text-sm font-semibold">Feature usage</h2>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
            <div className="mt-4 divide-y">
              {a.featureUsage.map((f) => (
                <div key={f.name} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{EVENT_LABELS[f.name] ?? f.name}</span>
                  <span className="font-semibold tabular-nums">{f.count}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            For deeper analysis (retention cohorts, exports) see ANALYTICS.md and the Supabase SQL editor.
          </p>
        </>
      )}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="bg-card p-5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-accent">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground/70">{sub}</p>}
    </div>
  )
}

function BarCard({
  title,
  caption,
  data,
  accent,
  delay,
}: {
  title: string
  caption: string
  data: DayCount[]
  accent: string
  delay: number
}) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="animate-fade-up rounded-2xl border bg-card p-6" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">{total} total</span>
      </div>
      <p className="text-xs text-muted-foreground">{caption}</p>
      <div className="mt-5 flex h-24 items-end gap-1">
        {data.map((d) => (
          <div key={d.day} className="group relative flex-1">
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height: `${Math.max(4, (d.count / max) * 96)}px`,
                backgroundColor: d.count > 0 ? accent : 'var(--accent)',
                opacity: d.count > 0 ? 0.85 : 0.4,
              }}
            />
            <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
              {d.count}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/60">
        <span>{data[0]?.day.slice(5)}</span>
        <span>{data[data.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  )
}

function FunnelRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">
          {value}
          {max > 0 && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{Math.round(pct)}%</span>}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-700"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  )
}
