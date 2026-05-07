'use client'

import type { WorkExperience } from '@/lib/types/resume'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  items: WorkExperience[]
  onChange: (index: number, fields: Partial<WorkExperience>) => void
  onAdd: () => void
  onDelete: (index: number) => void
}

export function ExperienceForm({ items, onChange, onAdd, onDelete }: Props) {
  return (
    <div className="grid gap-4">
      {items.map((item, i) => (
        <div key={item.id} className="grid gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {item.company || item.role
                ? `${item.role || 'Role'} at ${item.company || 'Company'}`
                : `Experience ${i + 1}`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onDelete(i)}
            >
              Remove
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Company</Label>
              <Input
                value={item.company ?? ''}
                onChange={(e) => onChange(i, { company: e.target.value })}
                placeholder="Google"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Input
                value={item.role ?? ''}
                onChange={(e) => onChange(i, { role: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Location</Label>
              <Input
                value={item.location ?? ''}
                onChange={(e) => onChange(i, { location: e.target.value })}
                placeholder="Sydney, NSW"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Start date</Label>
              <Input
                value={item.start_date ?? ''}
                onChange={(e) => onChange(i, { start_date: e.target.value })}
                placeholder="2023-01"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>End date</Label>
              <Input
                value={item.end_date ?? ''}
                onChange={(e) => onChange(i, { end_date: e.target.value })}
                placeholder="Present"
                disabled={item.is_current}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.is_current}
              onChange={(e) =>
                onChange(i, {
                  is_current: e.target.checked,
                  end_date: e.target.checked ? null : item.end_date,
                })
              }
              className="rounded"
            />
            Currently working here
          </label>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={item.description ?? ''}
              onChange={(e) => onChange(i, { description: e.target.value })}
              placeholder="• Led development of...&#10;• Improved performance by..."
            />
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={onAdd} className="w-full">
        + Add experience
      </Button>
    </div>
  )
}
