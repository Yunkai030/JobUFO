'use client'

import type { Project } from '@/lib/types/resume'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  items: Project[]
  onChange: (index: number, fields: Partial<Project>) => void
  onAdd: () => void
  onDelete: (index: number) => void
}

export function ProjectsForm({ items, onChange, onAdd, onDelete }: Props) {
  return (
    <div className="grid gap-4">
      {items.map((item, i) => (
        <div key={item.id} className="grid gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {item.name || `Project ${i + 1}`}
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
              <Label>Project name</Label>
              <Input
                value={item.name ?? ''}
                onChange={(e) => onChange(i, { name: e.target.value })}
                placeholder="JobUFO"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>URL</Label>
              <Input
                value={item.url ?? ''}
                onChange={(e) => onChange(i, { url: e.target.value })}
                placeholder="github.com/you/project"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Technologies</Label>
            <Input
              value={item.technologies ?? ''}
              onChange={(e) => onChange(i, { technologies: e.target.value })}
              placeholder="React, Node.js, PostgreSQL"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={item.description ?? ''}
              onChange={(e) => onChange(i, { description: e.target.value })}
              placeholder="• Built a full-stack app that...&#10;• Implemented..."
            />
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={onAdd} className="w-full">
        + Add project
      </Button>
    </div>
  )
}
