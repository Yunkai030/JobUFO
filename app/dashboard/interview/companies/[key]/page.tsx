import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompanyInsight, getCompanyExperiences } from '@/lib/interview-experience/actions'
import type { ExperienceLanguage } from '@/lib/types/interview-experience'
import { OUTCOME_LABELS } from '@/lib/types/interview-experience'
import { ArrowLeft, Sparkles, ListChecks, MessageCircleQuestion, Lightbulb, Mic } from 'lucide-react'

export default async function CompanyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { key } = await params
  const { lang } = await searchParams
  const companyKey = decodeURIComponent(key)
  const language: ExperienceLanguage = lang === 'zh' ? 'zh' : 'en'

  const [insight, experiences] = await Promise.all([
    getCompanyInsight(companyKey, language),
    getCompanyExperiences(companyKey),
  ])

  if (experiences.length === 0) notFound()

  const company = experiences[0].company

  return (
    <div className="max-w-3xl space-y-6">
      <div className="animate-fade-up">
        <Link
          href="/dashboard/interview/companies"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All companies
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight capitalize">{company}</h1>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center gap-1 rounded-full border bg-card p-0.5">
              {(['en', 'zh'] as const).map((l) => (
                <Link
                  key={l}
                  href={`?lang=${l}`}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    language === l ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l === 'en' ? 'EN' : '中文'}
                </Link>
              ))}
            </div>
            <Link
              href={`/dashboard/interview/mock/new?company=${encodeURIComponent(company)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
            >
              <Mic className="size-3.5" />
              Mock this company
            </Link>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Synthesized from {experiences.length} real experience{experiences.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* AI insight */}
      {insight && (
        <div className="glow-border animate-fade-up overflow-hidden rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80 p-6 text-background" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4" />
            <span className="text-sm font-semibold uppercase tracking-wider opacity-80">AI Insight</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed opacity-90">{insight.summary.overview}</p>
        </div>
      )}

      {insight && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InsightList icon={ListChecks} title={language === 'zh' ? '面试轮次' : 'Typical rounds'} items={insight.summary.rounds} delay={120} />
          <InsightList icon={MessageCircleQuestion} title={language === 'zh' ? '高频问题' : 'Common questions'} items={insight.summary.common_questions} delay={180} />
        </div>
      )}

      {insight && insight.summary.tips.length > 0 && (
        <div className="animate-fade-up rounded-2xl border bg-card p-6" style={{ animationDelay: '240ms' }}>
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">{language === 'zh' ? '备战建议' : 'Prep tips'}</h2>
          </div>
          <ul className="space-y-2">
            {insight.summary.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw experiences */}
      <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
        <h2 className="mb-3 text-lg font-semibold">Experiences</h2>
        <div className="space-y-3">
          {experiences.map((e) => (
            <div key={e.id} className="rounded-xl border bg-card p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                {e.role && <span className="font-medium">{e.role}</span>}
                {e.outcome && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-muted-foreground">
                    {OUTCOME_LABELS[e.outcome]}
                  </span>
                )}
                <span className="text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</span>
                <span className="text-muted-foreground/60">{e.language === 'zh' ? '中文' : 'EN'}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{e.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InsightList({
  icon: Icon,
  title,
  items,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: string[]
  delay: number
}) {
  if (!items || items.length === 0) return null
  return (
    <div className="animate-fade-up rounded-2xl border bg-card p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-2 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/50" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}
