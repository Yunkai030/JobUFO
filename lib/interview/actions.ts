'use server'

import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { getResumeById } from '@/lib/resume/queries'
import { track } from '@/lib/analytics/track'
import type { ResumeWithSections } from '@/lib/types/resume'

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
    for (const edu of r.education) {
      lines.push(`- ${edu.degree ?? ''} at ${edu.institution ?? ''}`)
    }
  }
  if (r.skills.length > 0) {
    lines.push('\nSkills:')
    for (const s of r.skills) {
      lines.push(`- ${s.category ?? ''}: ${s.items ?? ''}`)
    }
  }
  if (r.projects.length > 0) {
    lines.push('\nProjects:')
    for (const p of r.projects) {
      lines.push(`- ${p.name ?? ''}: ${p.description ?? ''}`)
    }
  }
  return lines.join('\n')
}

const SYSTEM_PROMPT = `You are an expert interview coach. Based on the candidate's resume and the job description, generate a set of likely interview questions the candidate should prepare for.

Generate exactly 10 questions with a mix of types:
- 4 behavioral questions (based on past experience, use STAR method)
- 4 technical questions (based on required skills and technologies in the JD)
- 2 situational questions (hypothetical scenarios relevant to the role)

For each question, tailor it to the specific gap or strength between the resume and JD.

Respond with valid JSON only, using this schema:
{
  "job_title": "extracted from JD",
  "company": "extracted from JD or empty string",
  "questions": [
    {
      "type": "behavioral | technical | situational",
      "question": "the interview question",
      "why": "why this question is likely to be asked (1 sentence, referencing resume/JD gap or match)",
      "tips": ["tip1", "tip2", "tip3"],
      "sample_framework": "a structured answer outline the candidate can follow, 3-5 sentences"
    }
  ]
}`

export async function generateInterviewPrep(
  resumeId: string,
  jobDescription: string
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const resume = await getResumeById(resumeId)
  if (!resume) return { error: 'Resume not found' }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return { error: 'Groq API key not configured' }

  const groq = new Groq({ apiKey })
  const resumeText = resumeToText(resume)

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `## Resume\n${resumeText}\n\n## Job Description\n${jobDescription}`,
      },
    ],
  })

  const responseText = completion.choices[0]?.message?.content ?? ''

  let parsed: { job_title?: string; company?: string; questions: unknown[] }
  try {
    parsed = JSON.parse(responseText)
  } catch {
    return { error: 'Failed to parse AI response' }
  }

  const { data, error } = await supabase
    .from('interview_preps')
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      job_title: parsed.job_title || null,
      company: parsed.company || null,
      job_description: jobDescription,
      questions: parsed.questions,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await track('interview_prep_generated', {
    resume_id: resumeId,
    question_count: Array.isArray(parsed.questions) ? parsed.questions.length : 0,
  })

  return { id: data.id }
}

export async function getInterviewPreps() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('interview_preps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}
