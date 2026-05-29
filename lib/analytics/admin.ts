import { createClient } from '@/lib/supabase/server'

/**
 * True only if the signed-in user's email is in ADMIN_EMAILS
 * (comma-separated). If the env var is unset, nobody is admin.
 */
export async function isAdmin(): Promise<boolean> {
  const allow = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (allow.length === 0) return false

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return !!user?.email && allow.includes(user.email.toLowerCase())
}
