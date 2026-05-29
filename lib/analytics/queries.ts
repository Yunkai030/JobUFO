import { createAdminClient } from '@/lib/supabase/admin'

interface RawEvent {
  user_id: string | null
  event_name: string
  properties: Record<string, unknown>
  created_at: string
}

export interface DayCount {
  day: string // YYYY-MM-DD
  count: number
}

export interface AnalyticsSummary {
  totalEvents: number
  totalSignups: number
  signups7d: number
  dau: DayCount[] // last 14 days, distinct users with app_opened
  aiCalls: DayCount[] // last 14 days
  featureUsage: { name: string; count: number }[] // last 30 days
  funnel: { signedUp: number; startedCheckout: number; becamePro: number }
  conversionPct: number
  hasData: boolean
}

const AI_EVENTS = ['ats_check_run', 'interview_prep_generated', 'mock_interview_started']

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

/** Last N day keys (oldest → newest), including today. */
function lastNDays(n: number): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(today.getUTCDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

/**
 * Computes the analytics summary from the raw events table using the
 * service-role client. At early-stage volume we fetch recent rows and
 * aggregate in JS (simple, no DB functions needed).
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const admin = createAdminClient()

  const { data } = await admin
    .from('events')
    .select('user_id, event_name, properties, created_at')
    .order('created_at', { ascending: false })
    .limit(10000)

  const events = (data ?? []) as RawEvent[]

  const now = Date.now()
  const days7 = now - 7 * 864e5
  const days30 = now - 30 * 864e5

  // Distinct-user sets for the funnel.
  const usersByEvent = (name: string) =>
    new Set(events.filter((e) => e.event_name === name && e.user_id).map((e) => e.user_id))

  const signedUp = usersByEvent('user_signed_up')
  const startedCheckout = usersByEvent('checkout_started')
  const becamePro = usersByEvent('subscription_activated')

  // DAU (app_opened, distinct users per day) for last 14 days.
  const dauMap = new Map<string, Set<string>>()
  // AI calls per day for last 14 days.
  const aiMap = new Map<string, number>()
  // Feature usage in last 30 days.
  const usage = new Map<string, number>()

  for (const e of events) {
    const t = new Date(e.created_at).getTime()
    const k = dayKey(e.created_at)

    if (e.event_name === 'app_opened' && e.user_id) {
      if (!dauMap.has(k)) dauMap.set(k, new Set())
      dauMap.get(k)!.add(e.user_id)
    }
    if (AI_EVENTS.includes(e.event_name)) {
      aiMap.set(k, (aiMap.get(k) ?? 0) + 1)
    }
    if (t >= days30) {
      usage.set(e.event_name, (usage.get(e.event_name) ?? 0) + 1)
    }
  }

  const last14 = lastNDays(14)
  const dau: DayCount[] = last14.map((d) => ({ day: d, count: dauMap.get(d)?.size ?? 0 }))
  const aiCalls: DayCount[] = last14.map((d) => ({ day: d, count: aiMap.get(d) ?? 0 }))

  const featureUsage = [...usage.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const signups7d = events.filter(
    (e) => e.event_name === 'user_signed_up' && new Date(e.created_at).getTime() >= days7
  ).length

  const conversionPct =
    signedUp.size > 0 ? Math.round((becamePro.size / signedUp.size) * 1000) / 10 : 0

  return {
    totalEvents: events.length,
    totalSignups: signedUp.size,
    signups7d,
    dau,
    aiCalls,
    featureUsage,
    funnel: {
      signedUp: signedUp.size,
      startedCheckout: startedCheckout.size,
      becamePro: becamePro.size,
    },
    conversionPct,
    hasData: events.length > 0,
  }
}
