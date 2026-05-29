import type { NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { planForPriceId } from '@/lib/stripe/plans'

// Stripe needs the raw, unparsed body to verify the signature. In the App
// Router, `request.text()` returns exactly that — no special body config needed.
export const dynamic = 'force-dynamic'

const ACTIVE = ['active', 'trialing']

/** Reads the period-end timestamp, tolerating both old and new Stripe shapes. */
function getPeriodEnd(sub: Stripe.Subscription): string | null {
  const itemEnd = sub.items?.data?.[0]?.current_period_end
  const raw =
    itemEnd ??
    // older API versions exposed this at the top level
    (sub as unknown as { current_period_end?: number }).current_period_end
  return typeof raw === 'number' ? new Date(raw * 1000).toISOString() : null
}

/** Upserts subscription state onto the matching profile row. */
async function syncSubscription(sub: Stripe.Subscription) {
  const admin = createAdminClient()
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const priceId = sub.items?.data?.[0]?.price?.id ?? null

  // Map the Stripe status into our profile's subscription_status.
  // When fully canceled/unpaid we revert the user to 'free'.
  const status = ['canceled', 'unpaid', 'incomplete_expired'].includes(sub.status)
    ? 'free'
    : sub.status

  const update = {
    subscription_status: status,
    stripe_subscription_id: sub.id,
    subscription_price_id: priceId,
    subscription_plan: planForPriceId(priceId),
    subscription_current_period_end: getPeriodEnd(sub),
    subscription_cancel_at_period_end: sub.cancel_at_period_end ?? false,
  }

  // Prefer matching by metadata user id; fall back to the customer id.
  const userId = sub.metadata?.supabase_user_id
  const query = admin.from('profiles').update(update)

  const { error } = userId
    ? await query.eq('id', userId)
    : await query.eq('stripe_customer_id', customerId)

  if (error) console.error('[stripe webhook] failed to sync subscription', error)
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not set')
    return new Response('Webhook not configured', { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  const body = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id
          const sub = await stripe.subscriptions.retrieve(subId)
          // Carry the user id from the checkout session into the subscription
          // metadata so future events can match it even without a customer row.
          if (session.client_reference_id && !sub.metadata?.supabase_user_id) {
            sub.metadata = { ...sub.metadata, supabase_user_id: session.client_reference_id }
          }
          await syncSubscription(sub)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
      }
      default:
        // Ignore other event types.
        break
    }
  } catch (err) {
    console.error('[stripe webhook] handler error', err)
    // Return 500 so Stripe retries.
    return new Response('Handler error', { status: 500 })
  }

  return Response.json({ received: true })
}
