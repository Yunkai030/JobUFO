'use server'

import Groq from 'groq-sdk'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { track } from '@/lib/analytics/track'
import type {
  InterviewExperience,
  CompanyListItem,
  CompanyInsight,
  ExperienceLanguage,
  ExperienceSummary,
  CompanyInsightSummary,
} from '@/lib/types/interview-experience'

function companyKeyOf(company: string) {
  return company.trim().toLowerCase()
}

async function callGroq(system: string, user: string, temperature = 0.4): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Groq API key not configured')
  const groq = new Groq({ apiKey })
  const r = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return r.choices[0]?.message?.content ?? '{}'
}

// ── Submit an experience ────────────────────────────────────
export async function submitExperience(input: {
  company: string
  role: string
  language: ExperienceLanguage
  outcome: string
  content: string
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const company = input.company.trim()
  const content = input.content.trim()
  if (!company) return { error: 'Please enter the company' }
  if (content.length < 30) return { error: 'Please add a bit more detail (at least 30 characters)' }

  // AI-extract the essence so it's structured and searchable.
  let aiSummary: ExperienceSummary | null = null
  try {
    const raw = await callGroq(
      `Extract the essence of this interview experience as JSON. Respond in the SAME language as the experience text. Schema:
{ "format": "one-line description of the overall process", "rounds": ["round 1", "round 2"], "questions": ["notable question asked"], "difficulty": "easy | medium | hard", "tips": ["concrete tip"] }
Base it ONLY on the text provided. Keep arrays short (max 6).`,
      `Company: ${company}\nRole: ${input.role || 'N/A'}\n\nExperience:\n${content}`,
      0.3
    )
    aiSummary = JSON.parse(raw)
  } catch {
    aiSummary = null // extraction is best-effort; never block submission
  }

  const { data, error } = await supabase
    .from('interview_experiences')
    .insert({
      user_id: user.id,
      company,
      company_key: companyKeyOf(company),
      role: input.role.trim() || null,
      language: input.language,
      outcome: ['offer', 'rejected', 'pending'].includes(input.outcome) ? input.outcome : null,
      content,
      ai_summary: aiSummary,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await track('experience_submitted', { company, language: input.language })
  revalidatePath('/dashboard/interview/companies')
  return { id: data.id }
}

// ── Browse ──────────────────────────────────────────────────
export async function getCompanies(): Promise<CompanyListItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('interview_experiences')
    .select('company, company_key')
    .order('created_at', { ascending: false })
    .limit(5000)

  const map = new Map<string, CompanyListItem>()
  for (const row of data ?? []) {
    const existing = map.get(row.company_key)
    if (existing) existing.count++
    else map.set(row.company_key, { company: row.company, company_key: row.company_key, count: 1 })
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
}

export async function getCompanyExperiences(companyKey: string): Promise<InterviewExperience[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('interview_experiences')
    .select('*')
    .eq('company_key', companyKey)
    .order('created_at', { ascending: false })
  return (data ?? []) as InterviewExperience[]
}

// ── Company insights (AI synthesis, cached) ─────────────────
export async function getCompanyInsight(
  companyKey: string,
  language: ExperienceLanguage
): Promise<CompanyInsight | null> {
  const supabase = await createClient()

  const experiences = await getCompanyExperiences(companyKey)
  if (experiences.length === 0) return null

  // Return cache if it's still in sync with the number of experiences.
  const { data: cached } = await supabase
    .from('company_insights')
    .select('*')
    .eq('company_key', companyKey)
    .eq('language', language)
    .maybeSingle()

  if (cached && cached.source_count === experiences.length) {
    return cached as CompanyInsight
  }

  const company = experiences[0].company
  const langName = language === 'zh' ? 'Chinese (简体中文)' : 'English'
  const corpus = experiences
    .slice(0, 30)
    .map((e, i) => `--- Experience ${i + 1} (${e.role ?? 'role n/a'}) ---\n${e.content}`)
    .join('\n\n')

  let summary: CompanyInsightSummary
  try {
    const raw = await callGroq(
      `You synthesize what interviews at ${company} are really like, based ONLY on the real candidate experiences provided. Respond ENTIRELY in ${langName}. Do not invent details not supported by the experiences. JSON schema:
{ "overview": "2-3 sentence summary of the interview process", "rounds": ["typical round 1", "typical round 2"], "common_questions": ["recurring question"], "tips": ["concrete preparation tip for this company"] }
Keep arrays focused (max 8 each).`,
      corpus,
      0.4
    )
    summary = JSON.parse(raw)
  } catch {
    return null
  }

  // Cache via service-role (company_insights has no client write policy).
  const admin = createAdminClient()
  await admin.from('company_insights').upsert(
    {
      company_key: companyKey,
      language,
      company,
      summary,
      source_count: experiences.length,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'company_key,language' }
  )

  return {
    company_key: companyKey,
    language,
    company,
    summary,
    source_count: experiences.length,
    updated_at: new Date().toISOString(),
  }
}

/** Condensed company context for flavoring a mock interview. Returns '' if none. */
export async function getCompanyContextForMock(company: string): Promise<string> {
  const experiences = await getCompanyExperiences(companyKeyOf(company))
  if (experiences.length === 0) return ''

  const lines: string[] = []
  for (const e of experiences.slice(0, 12)) {
    if (e.ai_summary) {
      const s = e.ai_summary
      lines.push(
        `- Format: ${s.format ?? ''}. Rounds: ${(s.rounds ?? []).join(', ')}. Questions: ${(s.questions ?? []).join(' | ')}.`
      )
    } else {
      lines.push(`- ${e.content.slice(0, 300)}`)
    }
  }
  return lines.join('\n')
}
