'use client'

import type { PersonalInfo } from '@/lib/types/resume'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  data: PersonalInfo
  onChange: (fields: Partial<PersonalInfo>) => void
}

export function PersonalInfoForm({ data, onChange }: Props) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="pi-name">Full name</Label>
          <Input
            id="pi-name"
            value={data.full_name ?? ''}
            onChange={(e) => onChange({ full_name: e.target.value })}
            placeholder="John Smith"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pi-email">Email</Label>
          <Input
            id="pi-email"
            type="email"
            value={data.email ?? ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="pi-phone">Phone</Label>
          <Input
            id="pi-phone"
            value={data.phone ?? ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+61 400 000 000"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pi-location">Location</Label>
          <Input
            id="pi-location"
            value={data.location ?? ''}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Melbourne, VIC"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="pi-linkedin">LinkedIn</Label>
          <Input
            id="pi-linkedin"
            value={data.linkedin_url ?? ''}
            onChange={(e) => onChange({ linkedin_url: e.target.value })}
            placeholder="linkedin.com/in/..."
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pi-github">GitHub</Label>
          <Input
            id="pi-github"
            value={data.github_url ?? ''}
            onChange={(e) => onChange({ github_url: e.target.value })}
            placeholder="github.com/..."
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pi-portfolio">Portfolio</Label>
          <Input
            id="pi-portfolio"
            value={data.portfolio_url ?? ''}
            onChange={(e) => onChange({ portfolio_url: e.target.value })}
            placeholder="yoursite.com"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="pi-summary">Professional summary</Label>
        <Textarea
          id="pi-summary"
          rows={3}
          value={data.summary ?? ''}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="A brief overview of your experience and goals..."
        />
      </div>
    </div>
  )
}
