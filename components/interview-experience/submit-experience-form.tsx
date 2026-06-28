'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitExperience } from '@/lib/interview-experience/actions'
import type { ExperienceLanguage } from '@/lib/types/interview-experience'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function SubmitExperienceForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [language, setLanguage] = useState<ExperienceLanguage>('en')
  const [outcome, setOutcome] = useState('')
  const [content, setContent] = useState('')
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" />
        Share an experience
      </Button>
    )
  }

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitExperience({ company, role, language, outcome, content })
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Thanks for sharing! Your experience helps others.')
      setOpen(false)
      setCompany(''); setRole(''); setOutcome(''); setContent('')
      router.refresh()
    })
  }

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Share an interview experience</CardTitle>
            <CardDescription>
              Help others (and improve your own company-flavored mock interviews). AI extracts the key points automatically.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="exp-company">Company *</Label>
            <Input id="exp-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exp-role">Role</Label>
            <Input id="exp-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Engineer" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="exp-lang">Language</Label>
            <select
              id="exp-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as ExperienceLanguage)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="exp-outcome">Outcome</Label>
            <select
              id="exp-outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Prefer not to say</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="exp-content">Your experience *</Label>
          <Textarea
            id="exp-content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Walk through the rounds, the questions you were asked, the difficulty, and any tips. The more specific, the more useful."
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={pending} className="gap-1.5">
            {pending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving & analyzing...
              </>
            ) : (
              'Submit'
            )}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}
