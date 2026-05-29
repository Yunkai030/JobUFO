import Stripe from 'stripe'

/**
 * Server-side Stripe client. The secret key must NEVER reach the browser.
 *
 * We fall back to a harmless placeholder when STRIPE_SECRET_KEY is unset so the
 * module can be imported without throwing during local dev / before Stripe is
 * configured. Any real API call with the placeholder fails at runtime with a
 * Stripe auth error, which our server actions already catch and surface as a
 * friendly message. Webhook signature verification only needs the webhook
 * secret, so it is unaffected by the placeholder.
 *
 * We omit `apiVersion` so the SDK uses the version it was built against, which
 * keeps the TypeScript types in sync.
 */
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_not_configured',
  { typescript: true }
)

/** True only when a real secret key is present. */
export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)
