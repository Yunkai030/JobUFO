'use client'

import { useState, useTransition } from 'react'
import { createCheckoutSession } from '@/lib/stripe/actions'
import { PLANS, PRO_FEATURES, type PlanInterval } from '@/lib/stripe/plans'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function PricingCards() {
  const [interval, setInterval] = useState<PlanInterval>('yearly')
  const [pending, startTransition] = useTransition()

  const plan = PLANS.find((p) => p.interval === interval)!

  const handleSubscribe = () => {
    startTransition(async () => {
      const result = await createCheckoutSession(interval)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      window.location.href = result.url
    })
  }

  return (
    <div className="animate-scale-in mx-auto max-w-md">
      {/* Interval toggle */}
      <div className="mx-auto mb-6 flex w-fit items-center gap-1 rounded-full border bg-card p-1">
        {PLANS.map((p) => (
          <button
            key={p.interval}
            onClick={() => setInterval(p.interval)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              interval === p.interval
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.interval === 'monthly' ? 'Monthly' : 'Yearly'}
            {p.interval === 'yearly' && (
              <span className="ml-1.5 rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                -17%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pro card — dark gradient hero */}
      <div className="glow-border overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 p-8 text-background">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5" />
          <span className="text-sm font-semibold uppercase tracking-wider opacity-80">
            JobUFO Pro
          </span>
        </div>

        <div className="mt-5 flex items-end gap-1">
          <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
          <span className="mb-1.5 text-lg opacity-60">{plan.unit}</span>
        </div>
        <p className="mt-1 text-sm opacity-60">{plan.caption}</p>

        <Button
          onClick={handleSubscribe}
          disabled={pending}
          className="mt-6 w-full bg-background text-foreground hover:bg-background/90"
          size="lg"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Redirecting to checkout...
            </>
          ) : (
            'Upgrade to Pro'
          )}
        </Button>

        <ul className="mt-7 space-y-3">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background/15">
                <Check className="size-3" />
              </span>
              <span className="opacity-90">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Secure checkout by Stripe. Cancel anytime from your billing settings.
      </p>
    </div>
  )
}
