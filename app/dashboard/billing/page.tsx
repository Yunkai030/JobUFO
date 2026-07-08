import { getSubscription } from '@/lib/subscription/queries'
import { PricingCards } from '@/components/billing/pricing-cards'
import { ManageSubscription } from '@/components/billing/manage-subscription'
import { CheckCircle2, Info } from 'lucide-react'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const [subscription, params] = await Promise.all([getSubscription(), searchParams])

  return (
    <div className="max-w-3xl space-y-8">
      <div className="animate-fade-up text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {subscription.isVip ? 'Your subscription' : 'Upgrade to Pro'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {subscription.isVip
            ? 'Manage your plan and billing details.'
            : 'Unlock unlimited camera-on practice and interview coaching.'}
        </p>
      </div>

      {/* Post-checkout banners */}
      {params.status === 'success' && (
        <div className="animate-fade-up mx-auto flex max-w-md items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Payment successful — welcome to Pro! It may take a few seconds to activate.</span>
        </div>
      )}
      {params.status === 'cancelled' && (
        <div className="animate-fade-up mx-auto flex max-w-md items-center gap-3 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0" />
          <span>Checkout cancelled — no charge was made.</span>
        </div>
      )}

      {subscription.isVip ? (
        <ManageSubscription subscription={subscription} />
      ) : (
        <PricingCards />
      )}
    </div>
  )
}
