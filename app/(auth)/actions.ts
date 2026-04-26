'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type AuthState = { error?: string } | undefined

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp(parsed.data)
  if (error) return { error: error.message }

  // Supabase returns success with empty identities[] when the email is already
  // registered (avoids leaking which emails exist). Translate that into a clear
  // message pointing the user to login.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'This email is already registered. Please log in instead.' }
  }

  // If email confirmation is enabled, session will be null until user confirms.
  if (!data.session) {
    return { error: 'Check your email to confirm your account, then log in.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
