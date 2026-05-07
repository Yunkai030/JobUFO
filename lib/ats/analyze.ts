'use server'

import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { getResumeById } from '@/lib/resume/queries'
import { ATS_SYSTEM_PROMPT, buildUserMessage } from './prompt'
import type { ATSAnalysis } from '@/lib/types/ats'
import type { ResumeWithSections } from '@/lib/types/resume'

function resumeToText(r: ResumeWithSections): string {
  const lines: string[] = []
  const pi = r.personal_info
  if (pi) {
    if (pi.full_name) lines.push(`Name: ${pi.full_name}`)
    if (pi.email) lines.push(`Email: ${pi.email}`)
    if (pi.location) lines.push(`Location: ${pi.location}`)
    if (pi.summary) lines.push(`\nSummary:\n${pi.summary}`)
  }

  if (r.work_experience.length > 0) {
    lines.push('\nWork Experience:')
    for (const exp of r.work_experience) {
      const date = [exp.start_date, exp.is_current ? 'Present' : exp.end_date]
        .filter(Boolean)
        .join(' – ')
      lines.push(`- ${exp.role ?? ''} at ${exp.company ?? ''} (${date})`)
      if (exp.location) lines.push(`  Location: ${exp.location}`)
      if (exp.description) lines.push(`  ${exp.description}`)
    }
  }

  if (r.education.length > 0) {
    lines.push('\nEducation:')
    for (const edu of r.education) {
      const date = [edu.start_date, edu.end_date].filter(Boolean).join(' – ')
      lines.push(
        `- ${edu.degree ?? ''} ${edu.field_of_study ? `in ${edu.field_of_study}` : ''} at ${edu.institution ?? ''} (${date})`
      )
      if (edu.gpa) lines.push(`  GPA: ${edu.gpa}`)
      if (edu.description) lines.push(`  ${edu.description}`)
    }
  }

  if (r.skills.length > 0) {
    lines.push('\nSkills:')
    for (const s of r.skills) {
      lines.push(`- ${s.category ?? 'General'}: ${s.items ?? ''}`)
    }
  }

  if (r.projects.length > 0) {
    lines.push('\nProjects:')
    for (const p of r.projects) {
      lines.push(`- ${p.name ?? ''}${p.url ? ` (${p.url})` : ''}`)
      if (p.technologies) lines.push(`  Tech: ${p.technologies}`)
      if (p.description) lines.push(`  ${p.description}`)
    }
  }

  return lines.join('\n')
}

export async function runATSCheck(
  resumeId: string,
  jobDescription: string
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const resume = await getResumeById(resumeId)
  if (!resume) return { error: 'Resume not found' }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return { error: 'Groq API key not configured' }

  const groq = new Groq({ apiKey })
  const resumeText = resumeToText(resume)

  const chatCompletion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: ATS_SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(resumeText, jobDescription) },
    ],
  })

  const responseText = chatCompletion.choices[0]?.message?.content ?? ''

  let analysis: ATSAnalysis
  try {
    analysis = JSON.parse(responseText)
  } catch {
    return { error: 'Failed to parse AI response' }
  }

  const { data, error } = await supabase
    .from('ats_results')
    .insert({
      resume_id: resumeId,
      user_id: user.id,
      job_title: analysis.job_title || null,
      company: analysis.company || null,
      job_description: jobDescription,
      overall_score: Math.round(analysis.overall_score),
      keyword_score: Math.round(analysis.keyword_score),
      experience_score: Math.round(analysis.experience_score),
      achievement_score: Math.round(analysis.achievement_score),
      format_score: Math.round(analysis.format_score),
      matched_keywords: analysis.matched_keywords,
      missing_keywords: analysis.missing_keywords,
      suggestions: analysis.suggestions,
      raw_response: analysis,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: data.id }
}

export async function getATSResults(resumeId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ats_results')
    .select('*')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: false })

  return data ?? []
}
