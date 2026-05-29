import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { PRO_FEATURES } from '@/lib/stripe/plans'
import {
  FileText,
  Target,
  BarChart3,
  Mic,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Nav */}
      <header className="glass sticky top-0 z-50 border-b animate-fade-in">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Sparkles className="size-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">JobUFO</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-20">
        {/* Mesh gradient bg */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[15%] top-[10%] h-[400px] w-[400px] rounded-full bg-primary/[0.07] blur-[100px]" />
          <div className="absolute right-[20%] top-[30%] h-[300px] w-[300px] rounded-full bg-chart-3/[0.06] blur-[100px]" />
          <div className="absolute bottom-[10%] left-[40%] h-[350px] w-[350px] rounded-full bg-chart-4/[0.05] blur-[120px]" />
        </div>

        <div className="animate-fade-up text-center" style={{ animationDelay: '100ms' }}>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl lg:leading-[1.1]">
            Your entire
            <br />
            job search,
            <br />
            <span className="bg-gradient-to-r from-muted-foreground/80 to-muted-foreground/40 bg-clip-text text-transparent">
              one platform.
            </span>
          </h1>
        </div>

        <p className="animate-fade-up mx-auto mt-6 max-w-md text-center text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: '200ms' }}>
          Build resumes, pass ATS filters, track applications, and rehearse
          with an AI mock interviewer.
        </p>

        <div className="animate-fade-up mt-8 flex items-center gap-3" style={{ animationDelay: '300ms' }}>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:shadow-xl hover:shadow-foreground/10 hover:-translate-y-0.5 active:translate-y-0"
          >
            Start for free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: 'outline', size: 'lg' }) + ' rounded-xl'}
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card">
        <div className="stagger mx-auto grid max-w-5xl gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileText, title: 'Resume Builder', desc: 'Structured editor with PDF import and A4 preview' },
            { icon: Target, title: 'ATS Scorer', desc: 'AI keyword match, experience alignment, format check' },
            { icon: BarChart3, title: 'Tracker', desc: 'Applied to offer pipeline with Sankey visualization' },
            { icon: Mic, title: 'Mock Interview', desc: '5-round AI interviewer with real-time scoring' },
          ].map((f, i) => (
            <div
              key={f.title}
              className="group relative border-b p-8 text-center transition-colors hover:bg-accent/40 sm:border-r last:border-r-0 sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r"
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent transition-all group-hover:bg-foreground group-hover:text-background group-hover:scale-110 group-hover:shadow-lg">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Simple, honest pricing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start free. Upgrade when you&apos;re ready to go all-in.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-3xl border bg-card p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Free
              </p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight">$0</span>
                <span className="mb-1 text-muted-foreground">/forever</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Everything you need to get started.</p>
              <Link
                href="/signup"
                className={buttonVariants({ variant: 'outline', size: 'lg' }) + ' mt-6 w-full rounded-xl'}
              >
                Get started
              </Link>
              <ul className="mt-7 space-y-3 text-sm">
                {['Resume builder & PDF export', '3 ATS checks / month', '1 mock interview', 'Application tracker'].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Check className="size-3" />
                    </span>
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 p-8 text-background">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Pro</span>
              </div>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight">$9</span>
                <span className="mb-1 opacity-60">/mo</span>
              </div>
              <p className="mt-1 text-sm opacity-60">Unlimited everything. Cancel anytime.</p>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-xl bg-background py-2.5 text-center text-sm font-medium text-foreground transition-opacity hover:opacity-90"
              >
                Start for free
              </Link>
              <ul className="mt-7 space-y-3 text-sm">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background/15">
                      <Check className="size-3" />
                    </span>
                    <span className="opacity-90">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles className="size-3.5" />
          <span className="font-medium text-foreground">JobUFO</span>
        </div>
        <p className="mt-1.5">Your job application OS. © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
