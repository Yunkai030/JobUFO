import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles the link in Supabase confirmation / magic-link emails.
 *
 * Supabase verifies the email, then redirects here with a one-time `code`.
 * We exchange it for a session (sets the auth cookies) and send the user on to
 * the dashboard. On any failure we bounce to /login with a message.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const emailError = searchParams.get('error_description') ?? searchParams.get('error')

  if (emailError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(emailError)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Respect the proxy host in production (Vercel) so we don't redirect to
      // an internal hostname.
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocal = process.env.NODE_ENV === 'development'
      if (!isLocal && forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Could not verify email. Please try logging in.')}`
  )
}
