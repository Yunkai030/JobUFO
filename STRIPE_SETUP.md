# Stripe Setup — VIP Subscriptions

This guide gets paid subscriptions working. **You** must create the Stripe
account and copy the keys (I can't create financial accounts for you), but the
integration code is already built and waiting for these values.

> How the money flows: user clicks **Upgrade** → Stripe's hosted checkout page
> (card entered there, never on our server) → Stripe charges the card → money
> lands in **your Stripe balance** → Stripe **auto-pays out to your bank** on a
> schedule → Stripe pings our `/api/stripe/webhook` → we flip the user to Pro.

---

## 1. Create a Stripe account

1. Go to <https://dashboard.stripe.com/register> and sign up.
2. You can build & test everything in **Test mode** (toggle top-right) before
   activating your account. Test mode uses fake cards — no real money.
3. To receive real payouts later, complete **Activate account** (business
   details + your bank account). This is the "connect to my wallet" step — your
   bank account *is* the wallet. Do this yourself; never share bank details with
   anyone, including me.

## 2. Create the Product and Prices

1. Dashboard → **Product catalog** → **+ Add product**.
2. Name: `JobUFO Pro`. Add two **recurring** prices:
   - **Monthly** — e.g. `$9.00 USD`, billing period **Monthly**.
   - **Yearly** — e.g. `$72.00 USD`, billing period **Yearly**.
3. After saving, click each price and copy its **Price ID** (starts with
   `price_...`). You'll paste these into env vars below.

> Currency tip: pick the currency you want to be paid in (e.g. `AUD` if you're
> in Australia). It must match your payout account's supported currencies.

## 3. Copy your API keys

Dashboard → **Developers → API keys**:

| Env var | Where |
| --- | --- |
| `STRIPE_SECRET_KEY` | "Secret key" (`sk_test_...`, later `sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | "Publishable key" (`pk_test_...`) |
| `STRIPE_PRICE_ID_MONTHLY` | Price ID from step 2 |
| `STRIPE_PRICE_ID_YEARLY` | Price ID from step 2 |

Paste them into `.env.local` (local) and into Vercel's env vars (production —
see `DEPLOYMENT.md`).

## 4. Set up the webhook

The webhook is how Stripe tells our app a payment succeeded. It needs a signing
secret so we can verify the message is genuinely from Stripe.

### Local development

1. Install the Stripe CLI: <https://docs.stripe.com/stripe-cli> (or
   `scoop install stripe` / `brew install stripe`).
2. `stripe login`
3. In one terminal, forward events to your local app:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. It prints a signing secret (`whsec_...`). Put it in `.env.local` as
   `STRIPE_WEBHOOK_SECRET`, then restart `npm run dev`.

### Production (after deploying)

1. Dashboard → **Developers → Webhooks → + Add endpoint**.
2. Endpoint URL: `https://YOUR_DOMAIN/api/stripe/webhook`
3. Select events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Save, then copy the endpoint's **Signing secret** (`whsec_...`) into Vercel as
   `STRIPE_WEBHOOK_SECRET` (this is a *different* secret from the local one).

## 5. Enable the Billing Portal

So Pro users can manage/cancel their plan:

1. Dashboard → **Settings → Billing → Customer portal**
   (<https://dashboard.stripe.com/test/settings/billing/portal>).
2. Turn it on, allow "Cancel subscription" and "Update payment method", **Save**.
   Our "Manage billing" button opens this hosted portal.

## 6. Test the full flow

1. With the app + `stripe listen` running, go to `/dashboard/billing` →
   **Upgrade to Pro**.
2. On Stripe's checkout page use a **test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: any future date · CVC: any 3 digits · ZIP: any
3. After paying you're redirected back with a success banner. Within a second or
   two the webhook flips you to Pro (the **Pro** badge appears top-right).
4. Click **Manage billing** → cancel → confirm the badge disappears.

More test cards (failures, 3D Secure): <https://docs.stripe.com/testing>

## 7. Go live

1. Activate your Stripe account (step 1.3) and complete bank details.
2. Switch the dashboard to **Live mode** and redo: create the product/prices,
   copy the **live** keys (`sk_live_...`, `pk_live_...`, live `price_...`), and
   add a **live** webhook endpoint → live `whsec_...`.
3. Update those values in Vercel's **Production** environment and redeploy.

---

### What the code already does for you

- `lib/stripe/actions.ts` — creates the Checkout Session and Billing Portal
  session (server-side; secret key never reaches the browser).
- `app/api/stripe/webhook/route.ts` — verifies Stripe's signature and updates
  the user's `profiles` row via the Supabase service-role key.
- `lib/subscription/queries.ts` — `isVip()` / `getSubscription()` for gating.
- Free limits live in `lib/stripe/plans.ts` (`FREE_LIMITS`). Mock interviews are
  already gated; reuse `isVip()` to gate anything else.
