'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { getBaseUrl } from '@/lib/utils/url'
import type { PlanInterval } from '@/lib/stripe/plans'

type ActionResult = { url: string } | { error: string }

/**
 * Creates (or reuses) a Stripe Customer for the signed-in user, then opens a
 * Stripe-hosted Checkout Session for the chosen subscription plan.
 *
 * Card details are entered on Stripe's hosted page — they never touch our
 * server. On success Stripe redirects back and the webhook flips the user to
 * VIP. We pass the Supabase user id in metadata + client_reference_id so the
 * webhook can match the payment back to the right account.
 */
export async function createCheckoutSession(
  interval: PlanInterval
): Promise<ActionResult> {
  const priceId =
    interval === 'yearly'
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY

  if (!priceId) {
    return { error: 'This plan is not configured yet. Add the Stripe price ID to your environment.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in to upgrade.' }

  // Find or create the Stripe customer for this user.
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    // Persist immediately so a retry doesn't create duplicate customers.
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const baseUrl = await getBaseUrl()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      success_url: `${baseUrl}/dashboard/billing?status=success`,
      cancel_url: `${baseUrl}/dashboard/billing?status=cancelled`,
    })

    if (!session.url) return { error: 'Could not start checkout. Please try again.' }
    return { url: session.url }
  } catch (err) {
    console.error('[stripe] checkout error', err)
    return { error: 'Could not start checkout. Please try again.' }
  }
}

/**
 * Opens the Stripe-hosted Billing Portal so the user can update their card,
 * view invoices, or cancel — all handled by Stripe, no sensitive data on us.
 */
export async function createBillingPortalSession(): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return { error: 'No billing account found. Subscribe first.' }
  }

  const baseUrl = await getBaseUrl()

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/billing`,
    })
    return { url: session.url }
  } catch (err) {
    console.error('[stripe] portal error', err)
    return { error: 'Could not open billing portal. Please try again.' }
  }
}
