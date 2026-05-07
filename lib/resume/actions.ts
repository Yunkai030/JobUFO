'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type {
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Project,
} from '@/lib/types/resume'

// ── helpers ──────────────────────────────────────────────────
async function authedClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, user }
}

// ── resume CRUD ──────────────────────────────────────────────
export async function createResume(_formData?: FormData) {
  const title = _formData?.get('title') as string | null
  const { supabase, user } = await authedClient()

  const { data, error } = await supabase
    .from('resumes')
    .insert({ user_id: user.id, title: title ?? 'Untitled Resume' })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // auto-create empty personal_info row
  await supabase
    .from('personal_info')
    .insert({ resume_id: data.id, full_name: '', email: user.email })

  redirect(`/dashboard/resumes/${data.id}`)
}

export async function updateResume(
  resumeId: string,
  fields: { title?: string; target_role?: string; template?: string }
) {
  const { supabase } = await authedClient()

  const { error } = await supabase
    .from('resumes')
    .update(fields)
    .eq('id', resumeId)

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/resumes/${resumeId}`)
}

export async function deleteResume(resumeId: string) {
  const { supabase } = await authedClient()

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)

  if (error) throw new Error(error.message)
  redirect('/dashboard/resumes')
}

// ── personal info ────────────────────────────────────────────
export async function upsertPersonalInfo(
  resumeId: string,
  fields: Partial<Omit<PersonalInfo, 'id' | 'resume_id'>>
) {
  const { supabase } = await authedClient()

  const { data: existing } = await supabase
    .from('personal_info')
    .select('id')
    .eq('resume_id', resumeId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('personal_info')
      .update(fields)
      .eq('resume_id', resumeId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('personal_info')
      .insert({ resume_id: resumeId, ...fields })
    if (error) throw new Error(error.message)
  }
}

// ── generic section CRUD (work_experience, education, skills, projects) ──
type SectionTable = 'work_experience' | 'education' | 'skills' | 'projects'
type SectionInsert =
  | Partial<Omit<WorkExperience, 'id'>>
  | Partial<Omit<Education, 'id'>>
  | Partial<Omit<Skill, 'id'>>
  | Partial<Omit<Project, 'id'>>

export async function addSectionItem(table: SectionTable, resumeId: string) {
  const { supabase } = await authedClient()

  // get next sort_order
  const { data: existing } = await supabase
    .from(table)
    .select('sort_order')
    .eq('resume_id', resumeId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from(table)
    .insert({ resume_id: resumeId, sort_order: nextOrder })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id as string
}

export async function updateSectionItem(
  table: SectionTable,
  itemId: string,
  fields: SectionInsert
) {
  const { supabase } = await authedClient()

  const { error } = await supabase
    .from(table)
    .update(fields)
    .eq('id', itemId)

  if (error) throw new Error(error.message)
}

export async function deleteSectionItem(table: SectionTable, itemId: string) {
  const { supabase } = await authedClient()

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', itemId)

  if (error) throw new Error(error.message)
}

export async function reorderSectionItems(
  table: SectionTable,
  orderedIds: string[]
) {
  const { supabase } = await authedClient()

  const updates = orderedIds.map((id, index) =>
    supabase.from(table).update({ sort_order: index }).eq('id', id)
  )

  await Promise.all(updates)
}
