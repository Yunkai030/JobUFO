'use client'

import type { Education } from '@/lib/types/resume'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  items: Education[]
  onChange: (index: number, fields: Partial<Education>) => void
  onAdd: () => void
  onDelete: (index: number) => void
}

export function EducationForm({ items, onChange, onAdd, onDelete }: Props) {
  return (
    <div className="grid gap-4">
      {items.map((item, i) => (
        <div key={item.id} className="grid gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {item.institution || item.degree
                ? `${item.degree || 'Degree'} — ${item.institution || 'Institution'}`
                : `Education ${i + 1}`}
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
              <Label>Institution</Label>
              <Input
                value={item.institution ?? ''}
                onChange={(e) => onChange(i, { institution: e.target.value })}
                placeholder="Monash University"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Degree</Label>
              <Input
                value={item.degree ?? ''}
                onChange={(e) => onChange(i, { degree: e.target.value })}
                placeholder="Bachelor of Computer Science"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Field of study</Label>
              <Input
                value={item.field_of_study ?? ''}
                onChange={(e) => onChange(i, { field_of_study: e.target.value })}
                placeholder="Software Engineering"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Location</Label>
              <Input
                value={item.location ?? ''}
                onChange={(e) => onChange(i, { location: e.target.value })}
                placeholder="Melbourne, VIC"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Start date</Label>
              <Input
                value={item.start_date ?? ''}
                onChange={(e) => onChange(i, { start_date: e.target.value })}
                placeholder="2020-03"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>End date</Label>
              <Input
                value={item.end_date ?? ''}
                onChange={(e) => onChange(i, { end_date: e.target.value })}
                placeholder="2024-12"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>GPA</Label>
              <Input
                value={item.gpa ?? ''}
                onChange={(e) => onChange(i, { gpa: e.target.value })}
                placeholder="3.8 / 4.0"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={item.description ?? ''}
              onChange={(e) => onChange(i, { description: e.target.value })}
              placeholder="Dean's List, relevant coursework, awards..."
            />
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={onAdd} className="w-full">
        + Add education
      </Button>
    </div>
  )
}
