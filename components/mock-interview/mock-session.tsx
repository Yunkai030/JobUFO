'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import type { MockInterview } from '@/lib/types/mock-interview'
import { ROUND_LABELS } from '@/lib/types/mock-interview'
import { submitAnswer, advanceRound } from '@/lib/mock-interview/actions'
import { useSpeechRecognition, useSpeechSynthesis } from '@/lib/hooks/use-speech'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { MockReport } from './mock-report'
import {
  Hand,
  MessageSquare,
  Wrench,
  Lightbulb,
  Flag,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  type LucideIcon,
} from 'lucide-react'

const ROUND_ICON_MAP: Record<string, LucideIcon> = {
  intro: Hand,
  behavioral: MessageSquare,
  technical: Wrench,
  situational: Lightbulb,
  closing: Flag,
}

const ROUND_COLOR_MAP: Record<string, string> = {
  intro: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/50',
  behavioral: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-950/50',
  technical: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/50',
  situational: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50',
  closing: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/50',
}

interface Props {
  interview: MockInterview
}

export function MockSession({ interview: initialInterview }: Props) {
  const [interview, setInterview] = useState(initialInterview)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(() => {
    const round = initialInterview.rounds[initialInterview.current_round]
    if (!round) return 0
    const idx = round.questions.findIndex((q) => q.answer === null)
    return idx === -1 ? round.questions.length - 1 : idx
  })
  const [pending, startTransition] = useTransition()
  const [advancePending, startAdvanceTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Voice: speak the question, dictate the answer.
  const tts = useSpeechSynthesis()
  const stt = useSpeechRecognition((finalText) => {
    setCurrentAnswer((prev) => (prev ? prev.trimEnd() + ' ' : '') + finalText)
  })

  const round = interview.rounds[interview.current_round]
  const question = round?.questions[currentQuestionIdx]
  const allQuestionsAnswered = round?.questions.every((q) => q.answer !== null) ?? false
  const isLastRound = interview.current_round >= interview.rounds.length - 1

  useEffect(() => {
    textareaRef.current?.focus()
  }, [currentQuestionIdx, interview.current_round])

  if (interview.status === 'completed' && interview.report) {
    return <MockReport interview={interview} />
  }

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() || !question) return
    stt.stop()
    tts.stop()
    startTransition(async () => {
      const result = await submitAnswer(
        interview.id,
        interview.current_round,
        currentQuestionIdx,
        currentAnswer.trim()
      )
      if ('error' in result) return

      const updatedRounds = [...interview.rounds]
      updatedRounds[interview.current_round] = {
        ...updatedRounds[interview.current_round],
        questions: updatedRounds[interview.current_round].questions.map((q, i) =>
          i === currentQuestionIdx
            ? { ...q, answer: currentAnswer.trim(), feedback: result.feedback, score: result.score }
            : q
        ),
      }
      setInterview({ ...interview, rounds: updatedRounds })
      setCurrentAnswer('')
    })
  }

  const handleNextQuestion = () => {
    tts.stop()
    stt.stop()
    if (currentQuestionIdx < (round?.questions.length ?? 0) - 1) {
      setCurrentQuestionIdx((i) => i + 1)
    }
  }

  const handleAdvanceRound = () => {
    tts.stop()
    stt.stop()
    startAdvanceTransition(async () => {
      await advanceRound(interview.id)
      if (isLastRound) {
        window.location.reload()
      } else {
        setInterview({
          ...interview,
          current_round: interview.current_round + 1,
        })
        setCurrentQuestionIdx(0)
        setCurrentAnswer('')
      }
    })
  }

  const roundType = round?.type ?? 'intro'
  const RoundIcon = ROUND_ICON_MAP[roundType] ?? Hand
  const roundColor = ROUND_COLOR_MAP[roundType] ?? ROUND_COLOR_MAP.intro

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Progress */}
      <div className="animate-fade-in flex items-center gap-1.5">
        {interview.rounds.map((r, i) => {
          const isComplete = i < interview.current_round
          const isCurrent = i === interview.current_round
          return (
            <div key={i} className="flex-1">
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-500 ease-out ${
                  isComplete
                    ? 'bg-foreground'
                    : isCurrent
                    ? 'bg-foreground/30'
                    : 'bg-border'
                }`}
              />
            </div>
          )
        })}
      </div>

      {/* Round header */}
      <div className="animate-fade-up flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-xl transition-all duration-300 ${roundColor}`}>
            <RoundIcon className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold leading-tight">
              {ROUND_LABELS[roundType]}
            </h2>
            <p className="text-xs text-muted-foreground">
              Question {currentQuestionIdx + 1} of {round?.questions.length ?? 0}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground rounded-full border px-3 py-1">
          {interview.current_round + 1} / {interview.rounds.length}
        </span>
      </div>

      {/* Question dots */}
      <div className="flex items-center gap-1.5">
        {round?.questions.map((q, i) => {
          const answered = q.answer !== null
          const active = i === currentQuestionIdx
          return (
            <button
              key={i}
              onClick={() => setCurrentQuestionIdx(i)}
              className={`flex size-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : answered
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {answered && !active ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                i + 1
              )}
            </button>
          )
        })}
      </div>

      {/* Question card */}
      {question && (
        <Card className="animate-scale-in">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-medium leading-relaxed">
                {question.question}
              </p>
              {tts.supported && (
                <button
                  onClick={() => (tts.speaking ? tts.stop() : tts.speak(question.question))}
                  title="Read question aloud"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    tts.speaking
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Volume2 className={`size-4 ${tts.speaking ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>

            {question.answer === null ? (
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    rows={6}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder={stt.supported ? 'Type or tap the mic to speak your answer...' : 'Type your answer... Be specific and detailed.'}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSubmitAnswer()
                      }
                    }}
                  />
                  {stt.supported && (
                    <button
                      onClick={() => (stt.listening ? stt.stop() : stt.start())}
                      title={stt.listening ? 'Stop' : 'Speak your answer'}
                      className={`absolute bottom-2.5 right-2.5 flex size-9 items-center justify-center rounded-full transition-all ${
                        stt.listening
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-foreground text-background hover:scale-105'
                      }`}
                    >
                      {stt.listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                      {stt.listening && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-40" />
                      )}
                    </button>
                  )}
                </div>

                {stt.listening && (
                  <p className="flex items-center gap-2 text-xs text-red-500">
                    <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
                    Listening…{stt.interim && <span className="italic text-muted-foreground">{stt.interim}</span>}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {stt.supported ? 'Type, speak, or Cmd + Enter to submit' : 'Cmd + Enter to submit'}
                  </span>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={pending || !currentAnswer.trim()}
                    className="gap-1.5"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* User answer */}
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Your answer</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{question.answer}</p>
                </div>

                {/* Feedback */}
                {question.feedback && (
                  <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-primary">AI Feedback</p>
                      {question.score !== null && <ScorePill score={question.score} />}
                    </div>
                    <p className="text-sm leading-relaxed">{question.feedback}</p>
                  </div>
                )}

                {/* Next question */}
                {currentQuestionIdx < (round?.questions.length ?? 0) - 1 &&
                  round?.questions[currentQuestionIdx + 1]?.answer === null && (
                  <Button onClick={handleNextQuestion} variant="outline" className="w-full gap-1.5">
                    Next question
                    <ArrowRight className="size-3.5" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advance */}
      {allQuestionsAnswered && (
        <Button
          onClick={handleAdvanceRound}
          disabled={advancePending}
          className="w-full gap-1.5"
          size="lg"
        >
          {advancePending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {isLastRound ? 'Generating report...' : 'Loading next round...'}
            </>
          ) : (
            <>
              {isLastRound ? 'Finish & view report' : `Continue to ${ROUND_LABELS[interview.rounds[interview.current_round + 1]?.type ?? 'behavioral']}`}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : score >= 60
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'

  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${color}`}>
      {score}/100
    </span>
  )
}
