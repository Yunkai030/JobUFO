'use client'

import type { MockInterview } from '@/lib/types/mock-interview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import {
  Hand,
  MessageSquare,
  Wrench,
  Lightbulb,
  Flag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  type LucideIcon,
} from 'lucide-react'

const ROUND_ICON_MAP: Record<string, LucideIcon> = {
  intro: Hand,
  behavioral: MessageSquare,
  technical: Wrench,
  situational: Lightbulb,
  closing: Flag,
}

interface Props {
  interview: MockInterview
}

export function MockReport({ interview }: Props) {
  const report = interview.report
  if (!report) return null

  const scoreColor =
    report.overall_score >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : report.overall_score >= 60
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400'

  const scoreBg =
    report.overall_score >= 80
      ? 'from-emerald-50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10'
      : report.overall_score >= 60
      ? 'from-amber-50 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/10'
      : 'from-red-50 to-red-100/30 dark:from-red-950/30 dark:to-red-900/10'

  return (
    <div className="stagger mx-auto max-w-3xl space-y-5">
      {/* Score hero - dark card */}
      <div className="rounded-2xl bg-gradient-to-br from-foreground via-foreground/95 to-foreground/85 p-8 text-background text-center">
        <p className="text-sm font-medium opacity-60">Overall Score</p>
        <p className="text-7xl font-bold tracking-tighter mt-1">
          {report.overall_score}
        </p>
        <p className="mt-2 text-sm opacity-50">
          {interview.role} at {interview.company}
        </p>
      </div>

      {/* Round scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Round Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {report.round_scores.map((rs, i) => {
              const roundType = interview.rounds[i]?.type ?? 'intro'
              const Icon = ROUND_ICON_MAP[roundType] ?? Hand
              return (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rs.round}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{rs.comment}</p>
                  </div>
                  <RoundScoreBadge score={rs.score} />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Strengths + Weaknesses */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-emerald-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold dark:bg-emerald-900/30 dark:text-emerald-400">
                    +
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-600" />
              Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold dark:bg-amber-900/30 dark:text-amber-400">
                    !
                  </span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-primary" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {report.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/interview/mock"
          className={buttonVariants({ variant: 'outline' }) + ' flex-1'}
        >
          Back to history
        </Link>
        <Link
          href="/dashboard/interview/mock/new"
          className={buttonVariants() + ' flex-1 gap-1.5'}
        >
          <Plus className="size-4" />
          New interview
        </Link>
      </div>
    </div>
  )
}

function RoundScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : score >= 60
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'

  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${color}`}>
      {score}
    </span>
  )
}
