'use server'

import { redirect } from 'next/navigation'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

const PARSE_SYSTEM_PROMPT = `You are a resume parser. Extract structured data from the resume text provided.

You MUST respond with valid JSON only, using this exact schema:
{
  "personal_info": {
    "full_name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin_url": "",
    "github_url": "",
    "portfolio_url": "",
    "summary": ""
  },
  "work_experience": [
    {
      "company": "",
      "role": "",
      "location": "",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or null if current",
      "is_current": false,
      "description": "bullet points as text, each on a new line starting with •"
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field_of_study": "",
      "location": "",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM",
      "gpa": "",
      "description": ""
    }
  ],
  "skills": [
    {
      "category": "e.g. Programming Languages, Frameworks, Tools",
      "items": "comma-separated list"
    }
  ],
  "projects": [
    {
      "name": "",
      "url": "",
      "technologies": "comma-separated",
      "description": ""
    }
  ]
}

Rules:
- Extract ALL information from the resume, don't skip anything
- If a field is not present in the resume, use empty string or null
- For dates, use YYYY-MM format (e.g. "2023-01"). If only year is given, use "YYYY-01"
- Group skills into logical categories (e.g. Languages, Frameworks, Tools, Soft Skills)
- Keep descriptions faithful to the original text
- For work experience descriptions, preserve bullet points as "• point1\\n• point2"`

export async function parseResumeFromPDF(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('No file provided')

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Parse PDF text
  const pdfParse = (await import('pdf-parse-new')).default
  const pdfData = await pdfParse(buffer)
  const resumeText = pdfData.text

  if (!resumeText.trim()) throw new Error('Could not extract text from PDF')

  // Send to AI for structured extraction
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Groq API key not configured')

  const groq = new Groq({ apiKey })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: PARSE_SYSTEM_PROMPT },
      { role: 'user', content: `Parse this resume:\n\n${resumeText}` },
    ],
  })

  const responseText = completion.choices[0]?.message?.content ?? ''
  const parsed = JSON.parse(responseText)

  // Create resume
  const title = parsed.personal_info?.full_name
    ? `${parsed.personal_info.full_name}'s Resume`
    : 'Imported Resume'

  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .insert({ user_id: user.id, title })
    .select('id')
    .single()

  if (resumeError) throw new Error(resumeError.message)
  const resumeId = resume.id

  // Insert personal info
  if (parsed.personal_info) {
    await supabase.from('personal_info').insert({
      resume_id: resumeId,
      full_name: parsed.personal_info.full_name || null,
      email: parsed.personal_info.email || null,
      phone: parsed.personal_info.phone || null,
      location: parsed.personal_info.location || null,
      linkedin_url: parsed.personal_info.linkedin_url || null,
      github_url: parsed.personal_info.github_url || null,
      portfolio_url: parsed.personal_info.portfolio_url || null,
      summary: parsed.personal_info.summary || null,
    })
  }

  // Insert work experience
  if (parsed.work_experience?.length) {
    await supabase.from('work_experience').insert(
      parsed.work_experience.map((exp: Record<string, unknown>, i: number) => ({
        resume_id: resumeId,
        company: exp.company || null,
        role: exp.role || null,
        location: exp.location || null,
        start_date: exp.start_date || null,
        end_date: exp.end_date || null,
        is_current: exp.is_current ?? false,
        description: exp.description || null,
        sort_order: i,
      }))
    )
  }

  // Insert education
  if (parsed.education?.length) {
    await supabase.from('education').insert(
      parsed.education.map((edu: Record<string, unknown>, i: number) => ({
        resume_id: resumeId,
        institution: edu.institution || null,
        degree: edu.degree || null,
        field_of_study: edu.field_of_study || null,
        location: edu.location || null,
        start_date: edu.start_date || null,
        end_date: edu.end_date || null,
        gpa: edu.gpa || null,
        description: edu.description || null,
        sort_order: i,
      }))
    )
  }

  // Insert skills
  if (parsed.skills?.length) {
    await supabase.from('skills').insert(
      parsed.skills.map((s: Record<string, unknown>, i: number) => ({
        resume_id: resumeId,
        category: s.category || null,
        items: s.items || null,
        sort_order: i,
      }))
    )
  }

  // Insert projects
  if (parsed.projects?.length) {
    await supabase.from('projects').insert(
      parsed.projects.map((p: Record<string, unknown>, i: number) => ({
        resume_id: resumeId,
        name: p.name || null,
        url: p.url || null,
        technologies: p.technologies || null,
        description: p.description || null,
        sort_order: i,
      }))
    )
  }

  redirect(`/dashboard/resumes/${resumeId}`)
}
