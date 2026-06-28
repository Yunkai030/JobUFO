'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ── Minimal Web Speech API typings (not in the standard DOM lib) ──
interface SpeechRecognitionAlternative {
  transcript: string
}
interface SpeechRecognitionResult {
  isFinal: boolean
  0: SpeechRecognitionAlternative
}
interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

/**
 * Speech-to-text via the browser. Finalized phrases are delivered to `onFinal`;
 * `interim` holds the in-progress (not-yet-final) words for live display.
 */
export function useSpeechRecognition(onFinal: (text: string) => void, lang = 'en-US') {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const onFinalRef = useRef(onFinal)
  onFinalRef.current = onFinal

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null)
    return () => recRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        const text = res[0]?.transcript ?? ''
        if (res.isFinal) onFinalRef.current(text.trim())
        else interimText += text
      }
      setInterim(interimText)
    }
    rec.onend = () => {
      setListening(false)
      setInterim('')
    }
    rec.onerror = () => {
      setListening(false)
      setInterim('')
    }
    recRef.current = rec
    rec.start()
    setListening(true)
  }, [lang])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
    setInterim('')
  }, [])

  return { supported, listening, interim, start, stop }
}

/** Text-to-speech via the browser. */
export function useSpeechSynthesis() {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => window.speechSynthesis?.cancel()
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(u)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return { supported, speaking, speak, stop }
}
