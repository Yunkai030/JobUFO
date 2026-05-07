'use client'

import { useRef, useState, useTransition } from 'react'
import { parseResumeFromPDF } from '@/lib/resume/parse'
import { Button } from '@/components/ui/button'

export function UploadResume() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const handleClick = () => fileRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }
    setFileName(file.name)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      try {
        await parseResumeFromPDF(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse resume')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />
      <Button variant="outline" onClick={handleClick} disabled={pending}>
        {pending
          ? `Parsing ${fileName}...`
          : 'Upload PDF'}
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  )
}
