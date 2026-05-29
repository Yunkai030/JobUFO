'use client'

import { useState, useTransition } from 'react'
import type { Resume } from '@/lib/types/resume'
import type { InterviewPrep } from '@/lib/types/interview'
import { generateInterviewPrep } from '@/lib/interview/actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { InterviewPrepCard } from './interview-prep-card'

interface Props {
  resumes: Resume[]
  initialPreps: InterviewPrep[]
}

export function InterviewPrepForm({ resumes, initialPreps }: Props) {
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id ?? '')
  const [jobDescription, setJobDescription] = useState('')
  const [preps, setPreps] = useState<InterviewPrep[]>(initialPreps)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const handleGenerate = () => {
    if (!selectedResumeId) return setError('Please select a resume')
    if (!jobDescription.trim()) return setError('Please paste a job description')
    setError('')

    startTransition(async () => {
      const result = await generateInterviewPrep(selectedResumeId, jobDescription.trim())
      if ('error' in result) {
        setError(result.error)
        return
      }
      window.location.reload()
    })
  }

  return (
    <>
      <Card className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle>Quick Question Generator</CardTitle>
          <CardDescription>
            Generate 10 likely interview questions based on your resume and the job description.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="resume-select">Resume</Label>
            <select
              id="resume-select"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {resumes.length === 0 && <option value="">No resumes found</option>}
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="jd">Job Description</Label>
            <Textarea
              id="jd"
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleGenerate} disabled={pending} className="w-full">
            {pending ? 'Generating questions...' : 'Generate Questions'}
          </Button>
        </CardContent>
      </Card>

      {preps.length > 0 && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold">Previous Preps</h2>
          {preps.map((prep) => (
            <InterviewPrepCard key={prep.id} prep={prep} />
          ))}
        </div>
      )}
    </>
  )
}
