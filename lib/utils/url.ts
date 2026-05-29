import { headers } from 'next/headers'

/**
 * Resolves the site's base URL for building absolute redirect URLs.
 * Prefers NEXT_PUBLIC_SITE_URL (set this in production to your real domain),
 * otherwise derives it from the incoming request headers (works on Vercel and
 * in local dev).
 */
export async function getBaseUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const protocol = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}
