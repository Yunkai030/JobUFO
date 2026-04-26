import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let supabaseOk = false
  if (hasEnv) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.getSession()
      supabaseOk = !error
    } catch {
      supabaseOk = false
    }
  }

  return NextResponse.json({ ok: true, env: hasEnv, supabase: supabaseOk })
}
