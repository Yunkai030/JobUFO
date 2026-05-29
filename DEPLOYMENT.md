# Deployment — Vercel + Custom Domain

End-to-end guide to get JobUFO live on your own domain. Steps marked **(you)**
require accounts/credentials only you can create — I can't do those for you.

---

## Overview

```
GitHub repo  ──▶  Vercel (builds & hosts Next.js)  ──▶  yourdomain.com
                       │
                       ├─ env vars (Supabase, Stripe, AI keys)
                       └─ Supabase (database + auth)  +  Stripe (payments)
```

---

## 1. Run database migrations on Supabase **(you)**

Your Supabase project needs all 7 migrations applied, including the new
subscription one.

1. Supabase dashboard → **SQL Editor**.
2. Run `supabase/migrations/0007_subscription.sql` then
   `supabase/migrations/0008_events.sql` (paste each and **Run**). Earlier
   migrations `0001`–`0006` should already be applied; if you're setting up a
   fresh project, run them in order first.
3. Confirm: **Table editor** shows the new `profiles` subscription columns
   (`subscription_status`, `stripe_subscription_id`, …) and a new `events` table.

## 2. Push the code to GitHub **(you)**

```bash
git add -A
git commit -m "Add Stripe subscriptions + billing UI"
git push
```
(If the repo isn't on GitHub yet: create one at github.com/new, then
`git remote add origin <url>` and `git push -u origin main`.)

## 3. Import into Vercel **(you)**

1. Go to <https://vercel.com> and sign up / log in (GitHub login is easiest).
2. **Add New… → Project** → import your JobUFO repo.
3. Framework preset auto-detects **Next.js**. Leave build settings default.
4. **Before clicking Deploy**, expand **Environment Variables** and add the ones
   in the next section.

## 4. Environment variables (Vercel → Project → Settings → Environment Variables)

Add each of these for the **Production** (and **Preview**) environments:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase → Settings → API (**keep secret**) |
| `GROQ_API_KEY` | console.groq.com |
| `GEMINI_API_KEY` | aistudio.google.com/apikey (if used) |
| `ANTHROPIC_API_KEY` | console.anthropic.com (if used) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys |
| `STRIPE_PRICE_ID_MONTHLY` | Stripe price ID (`price_...`) |
| `STRIPE_PRICE_ID_YEARLY` | Stripe price ID (`price_...`) |
| `STRIPE_WEBHOOK_SECRET` | set **after** step 6 (the prod `whsec_...`) |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` (set after step 5) |
| `ADMIN_EMAILS` | your email(s), comma-separated — who can see `/dashboard/analytics` |

Then click **Deploy**. You'll get a `*.vercel.app` URL — verify the app loads.

> `NEXT_PUBLIC_SITE_URL` is used to build Stripe redirect URLs. If you skip it,
> the app falls back to the request's host, which also works — but set it once
> your domain is attached for clean, predictable URLs.

## 5. Buy & connect a domain **(you)**

You can buy a domain *through* Vercel (simplest) or use one you own elsewhere.

**Option A — buy via Vercel:**
1. Project → **Settings → Domains → Add** → search a name → purchase
   (~US$10–20/yr). DNS is configured automatically.

**Option B — domain from another registrar (Namecheap, GoDaddy, Cloudflare…):**
1. Project → **Settings → Domains → Add** → type `yourdomain.com`.
2. Vercel shows DNS records to add. At your registrar, add either:
   - an **A record** `@ → 76.76.21.21`, or
   - a **CNAME** `www → cname.vercel-dns.com`,
   following exactly what Vercel displays.
3. Wait for DNS to propagate (minutes to a couple of hours). Vercel
   auto-provisions an HTTPS certificate.

After the domain is live, update `NEXT_PUBLIC_SITE_URL` to
`https://yourdomain.com` and redeploy.

## 6. Point Stripe's webhook at production **(you)**

Follow **`STRIPE_SETUP.md` § 4 (Production)**: add a webhook endpoint at
`https://yourdomain.com/api/stripe/webhook`, subscribe to the four
`checkout.session.completed` / `customer.subscription.*` events, and paste the
endpoint's signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`. Redeploy.

## 7. Update Supabase auth URLs **(you)**

So magic-link / email confirmations point at your real domain:

1. Supabase → **Authentication → URL Configuration**.
2. **Site URL**: `https://yourdomain.com`
3. **Redirect URLs**: add `https://yourdomain.com/**`.

## 8. Smoke test production

- [ ] Sign up / log in works
- [ ] Create a resume, run an ATS check
- [ ] `/dashboard/billing` → upgrade with a **live or test** card → **Pro** badge
      appears (confirms the webhook is wired)
- [ ] **Manage billing** opens the Stripe portal
- [ ] Free limit: a free account is blocked from a 2nd mock interview with an
      upgrade prompt

---

## Notes & gotchas

- **Webhook is excluded from the proxy** (`proxy.ts` matcher) because it
  authenticates by Stripe signature, not a user session.
- **Service-role key** is server-only — it's never imported into client code.
  Keep it out of any `NEXT_PUBLIC_*` variable.
- **Redeploy after changing env vars** — Vercel bakes them in at build time.
- Free-tier limits live in `lib/stripe/plans.ts` (`FREE_LIMITS`) — tune them
  there.
