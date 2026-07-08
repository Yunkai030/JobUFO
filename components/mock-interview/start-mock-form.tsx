'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Resume } from '@/lib/types/resume'
import { startMockInterview } from '@/lib/mock-interview/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Camera, Sparkles } from 'lucide-react'

interface Props {
  resumes: Resume[]
  defaultCompany?: string
}

export function StartMockForm({ resumes, defaultCompany = '' }: Props) {
  const router = useRouter()
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id ?? '')
  const [company, setCompany] = useState(defaultCompany)
  const [role, setRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const handleStart = () => {
    if (!selectedResumeId) return setError('Please select a resume')
    if (!company.trim()) return setError('Please enter the company name')
    if (!role.trim()) return setError('Please enter the role')
    if (!jobDescription.trim()) return setError('Please paste the job description')
    setError('')

    startTransition(async () => {
      const result = await startMockInterview(
        selectedResumeId,
        company.trim(),
        role.trim(),
        jobDescription.trim()
      )
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push(`/dashboard/interview/mock/${result.id}`)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prepare a camera-on interview</CardTitle>
        <CardDescription>
          InterviewMirror creates a realistic video interview room tailored to your resume,
          the role, and real company interview signals when available.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="mock-resume">Resume</Label>
          <select
            id="mock-resume"
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

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="mock-company">Company</Label>
            <Input
              id="mock-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Canva"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="mock-role">Role</Label>
            <Input
              id="mock-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="mock-jd">Job Description</Label>
          <Textarea
            id="mock-jd"
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description so your interviewer can ask role-specific follow-ups..."
          />
        </div>

        {error && (
          error.includes('Upgrade to Pro') ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-foreground/15 bg-accent/50 px-4 py-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Link
                href="/dashboard/billing"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
              >
                <Sparkles className="size-3.5" />
                Upgrade
              </Link>
            </div>
          ) : (
            <p className="text-sm text-destructive">{error}</p>
          )
        )}

        <Button onClick={handleStart} disabled={pending} className="w-full gap-1.5">
          {pending ? (
            'Generating interview... (15-30s)'
          ) : (
            <>
              <Camera className="size-4" />
              Enter practice room
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
