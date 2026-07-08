'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { MockInterview } from '@/lib/types/mock-interview'
import { ROUND_LABELS } from '@/lib/types/mock-interview'
import { advanceRound, submitAnswer } from '@/lib/mock-interview/actions'
import { useSpeechRecognition, useSpeechSynthesis } from '@/lib/hooks/use-speech'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MockReport } from './mock-report'
import {
  ArrowRight,
  CheckCircle2,
  Flag,
  Hand,
  Lightbulb,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  Send,
  ShieldCheck,
  Timer,
  Video,
  VideoOff,
  Volume2,
  Wrench,
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
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const tts = useSpeechSynthesis()
  const stt = useSpeechRecognition((finalText) => {
    setCurrentAnswer((prev) => (prev ? prev.trimEnd() + ' ' : '') + finalText)
  })

  const round = interview.rounds[interview.current_round]
  const question = round?.questions[currentQuestionIdx]
  const allQuestionsAnswered = round?.questions.every((q) => q.answer !== null) ?? false
  const isLastRound = interview.current_round >= interview.rounds.length - 1
  const roundType = round?.type ?? 'intro'
  const RoundIcon = ROUND_ICON_MAP[roundType] ?? Hand
  const roundColor = ROUND_COLOR_MAP[roundType] ?? ROUND_COLOR_MAP.intro

  useEffect(() => {
    textareaRef.current?.focus()
  }, [currentQuestionIdx, interview.current_round])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  if (interview.status === 'completed' && interview.report) {
    return <MockReport interview={interview} />
  }

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraEnabled(true)
      setCameraError('')
    } catch {
      setCameraError('Camera permission was blocked. You can still practice with voice or text.')
      setCameraEnabled(false)
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraEnabled(false)
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

  return (
    <div className="space-y-5">
      <div className="animate-fade-in flex items-center gap-1.5">
        {interview.rounds.map((_, i) => {
          const isComplete = i < interview.current_round
          const isCurrent = i === interview.current_round
          return (
            <div key={i} className="flex-1">
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-500 ease-out ${
                  isComplete ? 'bg-foreground' : isCurrent ? 'bg-foreground/30' : 'bg-border'
                }`}
              />
            </div>
          )
        })}
      </div>

      <div className="animate-fade-up overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b bg-foreground px-4 py-4 text-background md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-background/12">
              <RoundIcon className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold leading-tight">InterviewMirror</h2>
              <p className="text-xs opacity-65">
                {interview.role} at {interview.company}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <StatusPill icon={Timer} label={`${interview.current_round + 1} / ${interview.rounds.length}`} />
            <StatusPill icon={ShieldCheck} label={ROUND_LABELS[roundType]} />
            <StatusPill icon={cameraEnabled ? Video : VideoOff} label={cameraEnabled ? 'Camera on' : 'Camera off'} />
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <section className="flex min-h-[420px] flex-col bg-neutral-950 p-3 text-white sm:p-4">
            <div className="relative flex flex-1 overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-white/10">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-full min-h-[360px] w-full object-cover transition-opacity ${
                  cameraEnabled ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {!cameraEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10">
                    <MonitorUp className="size-7" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Turn on your camera</p>
                    <p className="mt-1 max-w-sm text-sm text-white/55">
                      Practice while being seen, so the real video call feels less sudden.
                    </p>
                  </div>
                  <Button onClick={startCamera} className="bg-white text-neutral-950 hover:bg-white/90">
                    <Video className="size-4" />
                    Enable camera
                  </Button>
                  {cameraError && <p className="max-w-sm text-xs text-red-200">{cameraError}</p>}
                </div>
              )}

              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-xs backdrop-blur">
                <span className={`size-2 rounded-full ${cameraEnabled ? 'bg-emerald-400' : 'bg-white/35'}`} />
                Interview preview
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                <div className="min-w-0 rounded-lg bg-black/45 px-3 py-2 text-xs backdrop-blur">
                  <p className="truncate font-medium">{interview.role}</p>
                  <p className="truncate text-white/55">{interview.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => (stt.listening ? stt.stop() : stt.start())}
                    disabled={!stt.supported || question?.answer !== null}
                    title={stt.listening ? 'Stop listening' : 'Speak your answer'}
                    className={`flex size-10 items-center justify-center rounded-full transition-all disabled:opacity-50 ${
                      stt.listening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white/14 text-white hover:bg-white/22'
                    }`}
                  >
                    {stt.listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                  </button>
                  <button
                    onClick={() => (cameraEnabled ? stopCamera() : startCamera())}
                    title={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
                    className="flex size-10 items-center justify-center rounded-full bg-white/14 text-white transition-colors hover:bg-white/22"
                  >
                    {cameraEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-xl transition-all duration-300 ${roundColor}`}>
                  <RoundIcon className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold leading-tight">{ROUND_LABELS[roundType]}</h2>
                  <p className="text-xs text-muted-foreground">
                    Question {currentQuestionIdx + 1} of {round?.questions.length ?? 0}
                  </p>
                </div>
              </div>
            </div>

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
                    {answered && !active ? <CheckCircle2 className="size-3.5" /> : i + 1}
                  </button>
                )
              })}
            </div>

            {question && (
              <div className="animate-scale-in space-y-4">
                <div className="rounded-xl border bg-background p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Interviewer asks
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
                  <p className="text-base font-medium leading-relaxed">{question.question}</p>
                </div>

                {question.answer === null ? (
                  <div className="space-y-3">
                    <Textarea
                      ref={textareaRef}
                      rows={8}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={
                        stt.supported
                          ? 'Answer out loud, or type here if you need a fallback...'
                          : 'Type your answer... Be specific and detailed.'
                      }
                      className="resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitAnswer()
                      }}
                    />

                    {stt.listening && (
                      <p className="flex items-center gap-2 text-xs text-red-500">
                        <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
                        Listening
                        {stt.interim && <span className="italic text-muted-foreground">{stt.interim}</span>}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        Camera on. Breathe, answer, then submit.
                      </span>
                      <Button onClick={handleSubmitAnswer} disabled={pending || !currentAnswer.trim()} className="gap-1.5">
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
                    <div className="rounded-xl bg-muted/60 p-4">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Your answer</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{question.answer}</p>
                    </div>

                    {question.feedback && (
                      <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold text-primary">AI Feedback</p>
                          {question.score !== null && <ScorePill score={question.score} />}
                        </div>
                        <p className="text-sm leading-relaxed">{question.feedback}</p>
                      </div>
                    )}

                    {currentQuestionIdx < (round?.questions.length ?? 0) - 1 &&
                      round?.questions[currentQuestionIdx + 1]?.answer === null && (
                        <Button onClick={handleNextQuestion} variant="outline" className="w-full gap-1.5">
                          Next question
                          <ArrowRight className="size-3.5" />
                        </Button>
                      )}
                  </div>
                )}
              </div>
            )}

            {allQuestionsAnswered && (
              <Button onClick={handleAdvanceRound} disabled={advancePending} className="w-full gap-1.5" size="lg">
                {advancePending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {isLastRound ? 'Generating report...' : 'Loading next round...'}
                  </>
                ) : (
                  <>
                    {isLastRound
                      ? 'Finish & view report'
                      : `Continue to ${ROUND_LABELS[interview.rounds[interview.current_round + 1]?.type ?? 'behavioral']}`}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function StatusPill({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/10 px-3 py-1 text-background/75">
      <Icon className="size-3.5" />
      {label}
    </span>
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
    <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${color}`}>
      {score}/100
    </span>
  )
}
