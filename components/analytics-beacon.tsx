'use client'

import { useEffect } from 'react'
import { trackClient } from '@/lib/analytics/actions'

/**
 * Fires one `app_opened` event per browser session so we can compute DAU and
 * retention. Guarded by sessionStorage so navigations do not double-count.
 * Renders nothing.
 */
export function AnalyticsBeacon() {
  useEffect(() => {
    const KEY = 'interviewmirror_session_pinged'
    try {
      if (sessionStorage.getItem(KEY)) return
      sessionStorage.setItem(KEY, '1')
    } catch {
      // sessionStorage may be unavailable in private mode; still ping once per mount.
    }
    trackClient('app_opened').catch(() => {})
  }, [])

  return null
}
