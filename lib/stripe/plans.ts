/**
 * Plan configuration. The actual prices live in your Stripe Dashboard; here we
 * only reference their Price IDs (set as env vars) and describe them for the UI.
 *
 * Create two recurring Prices in Stripe (monthly + yearly) under one Product
 * called "InterviewMirror Pro", then paste their price IDs into these env vars.
 */
export type PlanInterval = 'monthly' | 'yearly'

export interface Plan {
  interval: PlanInterval
  name: string
  priceId: string | undefined
  /** Display price in your currency, e.g. "$9" */
  price: string
  /** e.g. "/mo" */
  unit: string
  /** Optional tagline shown under the price */
  caption?: string
}

export const PLANS: Plan[] = [
  {
    interval: 'monthly',
    name: 'Pro Monthly',
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY,
    price: '$9',
    unit: '/mo',
    caption: 'Billed monthly. Cancel anytime.',
  },
  {
    interval: 'yearly',
    name: 'Pro Yearly',
    priceId: process.env.STRIPE_PRICE_ID_YEARLY,
    price: '$72',
    unit: '/yr',
    caption: 'Billed yearly — 2 months free.',
  },
]

export const PRO_FEATURES = [
  'Unlimited ATS checks',
  'Unlimited camera-on practice sessions',
  'Unlimited AI interview prep',
  'Priority AI processing',
  'PDF resume export',
  'Early access to new features',
]

/** Free-tier limits, enforced server-side. */
export const FREE_LIMITS = {
  atsChecksPerMonth: 3,
  mockInterviewsTotal: 1,
}

export function planForPriceId(priceId: string | null | undefined): PlanInterval | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_ID_MONTHLY) return 'monthly'
  if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) return 'yearly'
  return null
}
