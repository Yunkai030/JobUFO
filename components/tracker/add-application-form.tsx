'use client'

import { useState, useTransition } from 'react'
import { createApplication } from '@/lib/application/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'

export function AddApplicationForm() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" />
        Add
      </Button>
    )
  }

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createApplication(formData)
      setOpen(false)
    })
  }

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>New Application</CardTitle>
            <CardDescription>Track a new job application</CardDescription>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" name="company" required placeholder="Google" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" name="role" required placeholder="Software Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="channel">Channel</Label>
              <Input id="channel" name="channel" placeholder="SEEK, LinkedIn..." />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Melbourne, VIC" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="salary_range">Salary range</Label>
              <Input id="salary_range" name="salary_range" placeholder="$80k-$100k" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="url">Job URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://..." />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} placeholder="Any notes..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Adding...' : 'Add application'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
