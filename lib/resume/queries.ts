'use server'

import { createClient } from '@/lib/supabase/server'
import type { Resume, ResumeWithSections } from '@/lib/types/resume'

export async function getResumes(): Promise<Resume[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getResumeById(resumeId: string): Promise<ResumeWithSections | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [resume, personalInfo, workExperience, education, skills, projects] =
    await Promise.all([
      supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('personal_info')
        .select('*')
        .eq('resume_id', resumeId)
        .single(),
      supabase
        .from('work_experience')
        .select('*')
        .eq('resume_id', resumeId)
        .order('sort_order'),
      supabase
        .from('education')
        .select('*')
        .eq('resume_id', resumeId)
        .order('sort_order'),
      supabase
        .from('skills')
        .select('*')
        .eq('resume_id', resumeId)
        .order('sort_order'),
      supabase
        .from('projects')
        .select('*')
        .eq('resume_id', resumeId)
        .order('sort_order'),
    ])

  if (resume.error || !resume.data) return null

  return {
    ...resume.data,
    personal_info: personalInfo.data ?? null,
    work_experience: workExperience.data ?? [],
    education: education.data ?? [],
    skills: skills.data ?? [],
    projects: projects.data ?? [],
  }
}
