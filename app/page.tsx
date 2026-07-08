import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { PRO_FEATURES } from '@/lib/stripe/plans'
import {
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  FileText,
  Target,
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="glass sticky top-0 z-50 border-b animate-fade-in">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Camera className="size-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">InterviewMirror</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="flex flex-1 items-center px-6 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl lg:leading-[1.08]">
              Stop freezing when the camera turns on.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Practice realistic video interviews with your camera on, answer out loud,
              and get feedback that helps you stay steady in the real call.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-foreground/10 active:translate-y-0"
              >
                Start camera practice
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' }) + ' rounded-xl'}>
                Log in
              </Link>
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-xs text-muted-foreground">
              <span className="rounded-lg border bg-card px-3 py-2">Camera-on rehearsal</span>
              <span className="rounded-lg border bg-card px-3 py-2">AI follow-ups</span>
              <span className="rounded-lg border bg-card px-3 py-2">Answer review</span>
            </div>
          </div>

          <div className="animate-scale-in rounded-2xl border bg-card p-3 shadow-sm" style={{ animationDelay: '180ms' }}>
            <div className="overflow-hidden rounded-xl bg-neutral-950 text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  Practice room
                </div>
                <span className="text-white/45">Behavioral round</span>
              </div>
              <div className="grid min-h-[360px] lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative flex items-center justify-center bg-neutral-900">
                  <div className="flex size-24 items-center justify-center rounded-3xl bg-white/10">
                    <Camera className="size-10 text-white/75" />
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-lg bg-black/45 px-3 py-2 text-xs backdrop-blur">
                    You, on camera
                  </div>
                </div>
                <div className="flex flex-col justify-between p-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/45">Interviewer asks</p>
                    <p className="mt-3 text-lg font-semibold leading-relaxed">
                      Tell me about a project where you had to handle pressure or ambiguity.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/8 p-4 text-sm text-white/70">
                    Follow-up coaching appears after your answer, with concrete feedback and a better version to practice.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="stagger mx-auto grid max-w-5xl gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Camera, title: 'Camera Practice', desc: 'A video interview room that makes being seen feel normal' },
            { icon: FileText, title: 'Resume Context', desc: 'Use your resume to shape realistic questions' },
            { icon: Target, title: 'JD Matching', desc: 'Tailor each session to the actual role' },
            { icon: BarChart3, title: 'Progress Review', desc: 'Track sessions, scores, and weak spots' },
          ].map((f) => (
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

      <section className="border-t px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Simple, honest pricing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start free. Upgrade when you need more practice before interviews.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
            <div className="rounded-3xl border bg-card p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Free</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight">$0</span>
                <span className="mb-1 text-muted-foreground">/forever</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Everything you need to try the flow.</p>
              <Link href="/signup" className={buttonVariants({ variant: 'outline', size: 'lg' }) + ' mt-6 w-full rounded-xl'}>
                Get started
              </Link>
              <ul className="mt-7 space-y-3 text-sm">
                {['Resume builder & PDF export', '3 ATS checks / month', '1 camera-on practice session', 'Application tracker'].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Check className="size-3" />
                    </span>
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 p-8 text-background">
              <div className="flex items-center gap-2">
                <Camera className="size-4" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Pro</span>
              </div>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight">$9</span>
                <span className="mb-1 opacity-60">/mo</span>
              </div>
              <p className="mt-1 text-sm opacity-60">Unlimited practice. Cancel anytime.</p>
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
          <Camera className="size-3.5" />
          <span className="font-medium text-foreground">InterviewMirror</span>
        </div>
        <p className="mt-1.5">Camera-on interview practice. © {new Date().getFullYear()}</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
