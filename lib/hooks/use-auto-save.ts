'use client'

import { useCallback, useRef, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(delay = 2000) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const trigger = useCallback(
    (saveFn: () => Promise<void>) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setStatus('idle')
      timerRef.current = setTimeout(async () => {
        try {
          setStatus('saving')
          await saveFn()
          setStatus('saved')
        } catch {
          setStatus('error')
        }
      }, delay)
    },
    [delay]
  )

  return { status, trigger }
}
