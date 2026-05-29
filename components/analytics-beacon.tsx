'use client'

import { useEffect } from 'react'
import { trackClient } from '@/lib/analytics/actions'

/**
 * Fires one `app_opened` event per browser session so we can compute DAU and
 * retention. Guarded by sessionStorage so navigations don't double-count.
 * Renders nothing.
 */
export function AnalyticsBeacon() {
  useEffect(() => {
    const KEY = 'jobufo_session_pinged'
    try {
      if (sessionStorage.getItem(KEY)) return
      sessionStorage.setItem(KEY, '1')
    } catch {
      // sessionStorage unavailable (private mode) — still ping once per mount.
    }
    trackClient('app_opened').catch(() => {})
  }, [])

  return null
}
