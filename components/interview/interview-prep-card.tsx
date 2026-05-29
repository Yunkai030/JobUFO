'use client'

import { useState } from 'react'
import type { InterviewPrep, InterviewQuestion } from '@/lib/types/interview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'

const TYPE_STYLES: Record<string, string> = {
  behavioral: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  technical: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  situational: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

function QuestionCard({ q, index }: { q: InterviewQuestion; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border transition-colors hover:border-foreground/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[q.type] ?? 'bg-muted text-muted-foreground'}`}>
              {q.type}
            </span>
          </div>
          <p className="text-sm font-medium">{q.question}</p>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="animate-slide-down border-t px-4 pb-4 pt-3 space-y-3">
          <div>
            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">Why this question</h4>
            <p className="text-sm text-muted-foreground">{q.why}</p>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">Tips</h4>
            <ul className="grid gap-1">
              {q.tips.map((tip, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">Answer framework</h4>
            <p className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">{q.sample_framework}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function InterviewPrepCard({ prep }: { prep: InterviewPrep }) {
  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle className="text-lg">
          {prep.job_title || 'Interview Prep'}
          {prep.company && <span className="text-muted-foreground font-normal"> -- {prep.company}</span>}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {new Date(prep.created_at).toLocaleString()}
          {' · '}
          {prep.questions.length} questions
        </p>
      </CardHeader>
      <CardContent className="stagger grid gap-2">
        {prep.questions.map((q, i) => (
          <QuestionCard key={i} q={q} index={i} />
        ))}
      </CardContent>
    </Card>
  )
}
