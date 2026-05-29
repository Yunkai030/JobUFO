'use client'

import type { ATSResult } from '@/lib/types/ats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScoreRing } from './score-ring'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  result: ATSResult
}

function ScoreBar({ label, score, delay }: { label: string; score: number; delay: number }) {
  const color =
    score >= 75
      ? 'bg-green-500'
      : score >= 50
        ? 'bg-yellow-500'
        : score >= 30
          ? 'bg-orange-500'
          : 'bg-red-500'

  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium tabular-nums">{score}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full animate-bar-grow ${color}`}
          style={{ width: `${score}%`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  )
}

export function ATSResultCard({ result }: Props) {
  return (
    <Card className="animate-scale-in overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {result.job_title || 'ATS Check'}
            </CardTitle>
            {result.company && (
              <p className="text-sm text-muted-foreground">{result.company}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(result.created_at).toLocaleString()}
            </p>
          </div>
          <div className="relative flex items-center justify-center">
            <ScoreRing score={result.overall_score} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Score breakdown */}
        <div className="grid gap-3">
          <ScoreBar label="Keyword Match" score={result.keyword_score} delay={100} />
          <ScoreBar label="Experience Relevance" score={result.experience_score} delay={200} />
          <ScoreBar label="Quantified Achievements" score={result.achievement_score} delay={300} />
          <ScoreBar label="Format & Structure" score={result.format_score} delay={400} />
        </div>

        {/* Keywords */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-green-600" />
              <h4 className="text-sm font-medium text-green-600">Matched Keywords</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.matched_keywords.map((kw, i) => (
                <span
                  key={kw}
                  className="animate-fade-in rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  style={{ animationDelay: `${i * 30 + 500}ms` }}
                >
                  {kw}
                </span>
              ))}
              {result.matched_keywords.length === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingDown className="size-3.5 text-red-600" />
              <h4 className="text-sm font-medium text-red-600">Missing Keywords</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.missing_keywords.map((kw, i) => (
                <span
                  key={kw}
                  className="animate-fade-in rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  style={{ animationDelay: `${i * 30 + 500}ms` }}
                >
                  {kw}
                </span>
              ))}
              {result.missing_keywords.length === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions -- grouped by section */}
        {result.suggestions.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Suggestions</h4>
            <div className="grid gap-3">
              {Object.entries(
                result.suggestions.reduce<
                  Record<string, typeof result.suggestions>
                >((acc, s) => {
                  const key = s.section || 'general'
                  ;(acc[key] ??= []).push(s)
                  return acc
                }, {})
              ).map(([section, items], idx) => {
                const topPriority = items.some((s) => s.priority === 'high')
                  ? 'high'
                  : items.some((s) => s.priority === 'medium')
                    ? 'medium'
                    : 'low'
                const priorityStyle =
                  topPriority === 'high'
                    ? 'border-l-red-500'
                    : topPriority === 'medium'
                      ? 'border-l-yellow-500'
                      : 'border-l-blue-500'
                const sectionLabel: Record<string, string> = {
                  work_experience: 'Work Experience',
                  education: 'Education',
                  skills: 'Skills',
                  projects: 'Projects',
                  summary: 'Summary',
                  general: 'General',
                }
                return (
                  <div
                    key={section}
                    className={`animate-fade-up rounded-r-lg border-l-3 bg-muted/50 p-3 ${priorityStyle}`}
                    style={{ animationDelay: `${idx * 80 + 600}ms` }}
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {sectionLabel[section] ?? section}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          topPriority === 'high'
                            ? 'text-red-600'
                            : topPriority === 'medium'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                        }`}
                      >
                        {topPriority}
                      </span>
                    </div>
                    <ul className="grid gap-1">
                      {items.map((s, j) => (
                        <li key={j} className="text-sm">
                          <span className="mr-1.5 inline-block size-1 rounded-full bg-muted-foreground/50 align-middle" />
                          {s.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
