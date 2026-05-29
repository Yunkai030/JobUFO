'use client'

import { useTransition } from 'react'
import { createBillingPortalSession } from '@/lib/stripe/actions'
import type { SubscriptionInfo } from '@/lib/subscription/queries'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function ManageSubscription({ subscription }: { subscription: SubscriptionInfo }) {
  const [pending, startTransition] = useTransition()

  const handlePortal = () => {
    startTransition(async () => {
      const result = await createBillingPortalSession()
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      window.location.href = result.url
    })
  }

  const periodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const planLabel =
    subscription.plan === 'yearly'
      ? 'Pro Yearly'
      : subscription.plan === 'monthly'
        ? 'Pro Monthly'
        : 'Pro'

  return (
    <div className="animate-scale-in mx-auto max-w-md space-y-4">
      {/* Active plan hero */}
      <div className="glow-border overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 p-8 text-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-wider opacity-80">
              {planLabel}
            </span>
          </div>
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
            {subscription.status === 'trialing' ? 'Trial' : 'Active'}
          </span>
        </div>

        <p className="mt-6 text-sm opacity-70">
          {subscription.cancelAtPeriodEnd
            ? periodEnd
              ? `Your plan ends on ${periodEnd}. You'll keep Pro access until then.`
              : 'Your plan is set to cancel at the end of the period.'
            : periodEnd
              ? `Renews on ${periodEnd}.`
              : 'Your Pro subscription is active.'}
        </p>
      </div>

      <Button onClick={handlePortal} disabled={pending} variant="outline" className="w-full" size="lg">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Opening billing portal...
          </>
        ) : (
          <>
            Manage billing
            <ExternalLink className="size-3.5" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Update your card, download invoices, or cancel — all handled securely by Stripe.
      </p>
    </div>
  )
}
