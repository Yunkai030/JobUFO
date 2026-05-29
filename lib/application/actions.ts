'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { track } from '@/lib/analytics/track'
import type { ApplicationStatus } from '@/lib/types/application'

async function authedClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, user }
}

export async function getApplications() {
  const { supabase, user } = await authedClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  return data ?? []
}

export async function createApplication(formData: FormData) {
  const { supabase, user } = await authedClient()

  const { error } = await supabase.from('applications').insert({
    user_id: user.id,
    company: formData.get('company') as string,
    role: formData.get('role') as string,
    url: (formData.get('url') as string) || null,
    channel: (formData.get('channel') as string) || null,
    location: (formData.get('location') as string) || null,
    salary_range: (formData.get('salary_range') as string) || null,
    status: 'applied',
    notes: (formData.get('notes') as string) || null,
  })

  if (error) throw new Error(error.message)

  await track('application_created', {
    company: formData.get('company') as string,
    channel: (formData.get('channel') as string) || null,
  })

  revalidatePath('/dashboard/tracker')
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const { supabase } = await authedClient()
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)

  await track('application_status_changed', { application_id: id, status })

  revalidatePath('/dashboard/tracker')
}

export async function updateApplication(
  id: string,
  fields: {
    company?: string
    role?: string
    url?: string | null
    channel?: string | null
    location?: string | null
    salary_range?: string | null
    status?: ApplicationStatus
    notes?: string | null
  }
) {
  const { supabase } = await authedClient()
  const { error } = await supabase
    .from('applications')
    .update(fields)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/tracker')
}

export async function deleteApplication(id: string) {
  const { supabase } = await authedClient()
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/tracker')
}
