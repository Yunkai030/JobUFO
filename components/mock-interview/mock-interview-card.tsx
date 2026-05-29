'use client'

import Link from 'next/link'
import type { MockInterview } from '@/lib/types/mock-interview'
import { ROUND_LABELS } from '@/lib/types/mock-interview'
import { Mic, FileBarChart, ChevronRight } from 'lucide-react'

interface Props {
  interview: MockInterview
}

export function MockInterviewCard({ interview }: Props) {
  const isCompleted = interview.status === 'completed'
  const overallScore = interview.report?.overall_score

  return (
    <Link
      href={`/dashboard/interview/mock/${interview.id}`}
      className="group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-accent/50 hover:pl-6"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
        {isCompleted ? (
          <FileBarChart className="size-5 text-muted-foreground" />
        ) : (
          <Mic className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {interview.role} @ {interview.company}
        </p>
        <p className="text-xs text-muted-foreground">
          {isCompleted
            ? 'Completed'
            : `Round ${interview.current_round + 1} — ${ROUND_LABELS[interview.rounds[interview.current_round]?.type ?? 'intro']}`}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {isCompleted && overallScore !== undefined && (
          <span className="text-sm font-bold">{overallScore}</span>
        )}
        {!isCompleted && (
          <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium">
            Active
          </span>
        )}
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {new Date(interview.created_at).toLocaleDateString()}
        </span>
        <ChevronRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}
