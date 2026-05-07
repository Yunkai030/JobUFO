'use client'

import { useState, useTransition } from 'react'
import type { Resume } from '@/lib/types/resume'
import type { ATSResult } from '@/lib/types/ats'
import { runATSCheck } from '@/lib/ats/analyze'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ATSResultCard } from './ats-result-card'

interface Props {
  resumes: Resume[]
  initialResults: ATSResult[]
}

export function ATSChecker({ resumes, initialResults }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id ?? '')
  const [jobDescription, setJobDescription] = useState('')
  const [results, setResults] = useState<ATSResult[]>(initialResults)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const handleCheck = () => {
    if (!selectedResumeId) {
      setError('Please select a resume first')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please paste a job description')
      return
    }
    setError('')

    startTransition(async () => {
      const result = await runATSCheck(selectedResumeId, jobDescription.trim())
      if ('error' in result) {
        setError(result.error)
        return
      }
      window.location.reload()
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">ATS Check</h1>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Resume vs Job Description</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="resume-select">Select resume</Label>
            <select
              id="resume-select"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {resumes.length === 0 && <option value="">No resumes found</option>}
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="jd">Job description</Label>
            <Textarea
              id="jd"
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleCheck} disabled={pending} className="w-full">
            {pending ? 'Analyzing with AI… (10-20s)' : 'Run ATS Check'}
          </Button>
        </CardContent>
      </Card>

      {/* Results history */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Results</h2>
          {results.map((r) => (
            <ATSResultCard key={r.id} result={r} />
          ))}
        </div>
      )}
    </div>
  )
}
