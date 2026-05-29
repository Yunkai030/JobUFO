'use server'

import Groq from 'groq-sdk'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getResumeById } from '@/lib/resume/queries'
import { getSubscription } from '@/lib/subscription/queries'
import { FREE_LIMITS } from '@/lib/stripe/plans'
import { track } from '@/lib/analytics/track'
import type { ResumeWithSections } from '@/lib/types/resume'
import type { MockRound, MockReport, MockInterview } from '@/lib/types/mock-interview'

function resumeToText(r: ResumeWithSections): string {
  const lines: string[] = []
  const pi = r.personal_info
  if (pi) {
    if (pi.full_name) lines.push(`Name: ${pi.full_name}`)
    if (pi.summary) lines.push(`Summary: ${pi.summary}`)
  }
  if (r.work_experience.length > 0) {
    lines.push('\nWork Experience:')
    for (const exp of r.work_experience) {
      lines.push(`- ${exp.role ?? ''} at ${exp.company ?? ''}`)
      if (exp.description) lines.push(`  ${exp.description}`)
    }
  }
  if (r.education.length > 0) {
    lines.push('\nEducation:')
    for (const edu of r.education)
      lines.push(`- ${edu.degree ?? ''} at ${edu.institution ?? ''}`)
  }
  if (r.skills.length > 0) {
    lines.push('\nSkills:')
    for (const s of r.skills) lines.push(`- ${s.category ?? ''}: ${s.items ?? ''}`)
  }
  if (r.projects.length > 0) {
    lines.push('\nProjects:')
    for (const p of r.projects)
      lines.push(`- ${p.name ?? ''}: ${p.description ?? ''}`)
  }
  return lines.join('\n')
}

async function callAI(systemPrompt: string, userMessage: string) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Groq API key not configured')
  const groq = new Groq({ apiKey })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })
  return completion.choices[0]?.message?.content ?? ''
}

// ── Start a new mock interview ──────────────────────────────
export async function startMockInterview(
  resumeId: string,
  company: string,
  role: string,
  jobDescription: string
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Free-tier gate: limit free users to FREE_LIMITS.mockInterviewsTotal sessions.
  const { isVip } = await getSubscription()
  if (!isVip) {
    const { count } = await supabase
      .from('mock_interviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count ?? 0) >= FREE_LIMITS.mockInterviewsTotal) {
      return {
        error: `Free plan includes ${FREE_LIMITS.mockInterviewsTotal} mock interview. Upgrade to Pro for unlimited practice.`,
      }
    }
  }

  const resume = await getResumeById(resumeId)
  if (!resume) return { error: 'Resume not found' }

  const resumeText = resumeToText(resume)

  const systemPrompt = `You are an interview question designer for ${company}, hiring for the role of ${role}.
Based on the candidate's resume and job description, generate a structured 5-round mock interview.

Each round has a specific purpose:
1. "intro" - Self introduction (1 question: "Tell me about yourself")
2. "behavioral" - Behavioral questions using STAR method (3 questions based on resume experience + JD requirements)
3. "technical" - Technical questions testing specific skills mentioned in JD (3 questions, can include coding concepts, system design, or domain knowledge)
4. "situational" - Hypothetical workplace scenarios (2 questions)
5. "closing" - Candidate's turn to ask questions (1 question: "Do you have any questions for us?")

Make questions realistic — like real ${company} interviews. Reference specific technologies, projects, and experiences from both the resume and JD.

Respond with JSON:
{
  "rounds": [
    {
      "type": "intro | behavioral | technical | situational | closing",
      "title": "Round name",
      "questions": [
        { "question": "the interview question", "answer": null, "feedback": null, "score": null }
      ]
    }
  ]
}`

  const response = await callAI(
    systemPrompt,
    `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`
  )

  let parsed: { rounds: MockRound[] }
  try {
    parsed = JSON.parse(response)
  } catch {
    return { error: 'Failed to generate interview questions' }
  }

  const { data, error } = await supabase
    .from('mock_interviews')
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      company,
      role,
      job_description: jobDescription,
      status: 'in_progress',
      current_round: 0,
      rounds: parsed.rounds,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await track('mock_interview_started', { company, role, resume_id: resumeId })

  return { id: data.id }
}

// ── Submit an answer and get feedback ───────────────────────
export async function submitAnswer(
  interviewId: string,
  roundIndex: number,
  questionIndex: number,
  answer: string
): Promise<{ feedback: string; score: number } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: interview } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('id', interviewId)
    .eq('user_id', user.id)
    .single()

  if (!interview) return { error: 'Interview not found' }

  const rounds = interview.rounds as MockRound[]
  const round = rounds[roundIndex]
  const question = round?.questions[questionIndex]
  if (!question) return { error: 'Question not found' }

  const systemPrompt = `You are an experienced interviewer at ${interview.company} evaluating a candidate's answer for the role of ${interview.role}.

The interview round type is: ${round.type}
The question was: "${question.question}"
The candidate answered: "${answer}"

Evaluate the answer and provide:
1. A score from 0-100
2. Constructive feedback (2-3 sentences): what was good, what could be improved, and a specific suggestion

For behavioral questions, evaluate using STAR method (Situation, Task, Action, Result).
For technical questions, evaluate correctness, depth, and clarity.
For intro, evaluate conciseness, relevance, and impact.
For closing, evaluate thoughtfulness of the candidate's questions.

Respond with JSON:
{
  "score": 0-100,
  "feedback": "your feedback here"
}`

  const response = await callAI(systemPrompt, answer)

  let parsed: { score: number; feedback: string }
  try {
    parsed = JSON.parse(response)
  } catch {
    return { error: 'Failed to evaluate answer' }
  }

  // Update the question with answer + feedback
  rounds[roundIndex].questions[questionIndex] = {
    ...question,
    answer,
    feedback: parsed.feedback,
    score: Math.round(parsed.score),
  }

  await supabase
    .from('mock_interviews')
    .update({ rounds })
    .eq('id', interviewId)

  revalidatePath(`/dashboard/interview/mock/${interviewId}`)
  return { feedback: parsed.feedback, score: Math.round(parsed.score) }
}

// ── Advance to next round ───────────────────────────────────
export async function advanceRound(interviewId: string) {
  const supabase = await createClient()
  const { data: interview } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('id', interviewId)
    .single()

  if (!interview) return

  const rounds = interview.rounds as MockRound[]
  const nextRound = interview.current_round + 1

  if (nextRound >= rounds.length) {
    // Interview complete — generate report
    await generateReport(interviewId)
  } else {
    await supabase
      .from('mock_interviews')
      .update({ current_round: nextRound })
      .eq('id', interviewId)
  }

  revalidatePath(`/dashboard/interview/mock/${interviewId}`)
}

// ── Generate final report ───────────────────────────────────
async function generateReport(interviewId: string) {
  const supabase = await createClient()
  const { data: interview } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('id', interviewId)
    .single()

  if (!interview) return

  const rounds = interview.rounds as MockRound[]

  const roundsSummary = rounds.map((r) => ({
    type: r.type,
    title: r.title,
    questions: r.questions.map((q) => ({
      question: q.question,
      answer: q.answer,
      score: q.score,
    })),
  }))

  const systemPrompt = `You are a senior hiring manager writing a post-interview evaluation report.

The candidate interviewed for ${interview.role} at ${interview.company}.
Below is the full interview with questions, answers, and per-question scores.

Generate a comprehensive report with:
1. overall_score (0-100, weighted average considering all rounds)
2. strengths (3-4 specific things the candidate did well, reference actual answers)
3. weaknesses (2-3 areas for improvement, be constructive)
4. suggestions (3-4 actionable tips for the next interview)
5. round_scores (score + 1-sentence comment for each round)

Respond with JSON:
{
  "overall_score": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "round_scores": [
    { "round": "round title", "score": 0-100, "comment": "brief comment" }
  ]
}`

  const response = await callAI(
    systemPrompt,
    JSON.stringify(roundsSummary)
  )

  let report: MockReport
  try {
    report = JSON.parse(response)
    report.overall_score = Math.round(report.overall_score)
    report.round_scores = report.round_scores.map((r) => ({
      ...r,
      score: Math.round(r.score),
    }))
  } catch {
    return
  }

  await supabase
    .from('mock_interviews')
    .update({ status: 'completed', report })
    .eq('id', interviewId)

  await track('mock_interview_completed', {
    interview_id: interviewId,
    overall_score: report.overall_score,
  })
}

// ── Queries ─────────────────────────────────────────────────
export async function getMockInterviews(): Promise<MockInterview[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []) as MockInterview[]
}

export async function getMockInterview(id: string): Promise<MockInterview | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  return (data as MockInterview) ?? null
}
