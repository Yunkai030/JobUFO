import { createClient } from '@/lib/supabase/server'
import type { PlanInterval } from '@/lib/stripe/plans'

export interface SubscriptionInfo {
  status: string // 'free' | 'active' | 'trialing' | 'past_due' | 'canceled' | ...
  isVip: boolean
  plan: PlanInterval | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
}

const ACTIVE_STATUSES = ['active', 'trialing']

/**
 * Reads the current user's subscription state from their profile row.
 * Returns a safe default (free, not VIP) if there is no user or no profile.
 */
export async function getSubscription(): Promise<SubscriptionInfo> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const freeDefault: SubscriptionInfo = {
    status: 'free',
    isVip: false,
    plan: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: null,
  }

  if (!user) return freeDefault

  const { data } = await supabase
    .from('profiles')
    .select(
      'subscription_status, subscription_plan, subscription_current_period_end, subscription_cancel_at_period_end, stripe_customer_id'
    )
    .eq('id', user.id)
    .single()

  if (!data) return freeDefault

  const status = data.subscription_status ?? 'free'

  return {
    status,
    isVip: ACTIVE_STATUSES.includes(status),
    plan: (data.subscription_plan as PlanInterval | null) ?? null,
    currentPeriodEnd: data.subscription_current_period_end ?? null,
    cancelAtPeriodEnd: data.subscription_cancel_at_period_end ?? false,
    stripeCustomerId: data.stripe_customer_id ?? null,
  }
}

/** Convenience helper for gating features. */
export async function isVip(): Promise<boolean> {
  return (await getSubscription()).isVip
}
