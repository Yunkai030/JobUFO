'use client'

import type { Skill } from '@/lib/types/resume'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  items: Skill[]
  onChange: (index: number, fields: Partial<Skill>) => void
  onAdd: () => void
  onDelete: (index: number) => void
}

export function SkillsForm({ items, onChange, onAdd, onDelete }: Props) {
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
          <div className="grid flex-1 grid-cols-[140px_1fr] gap-3">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Input
                value={item.category ?? ''}
                onChange={(e) => onChange(i, { category: e.target.value })}
                placeholder="Languages"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Skills</Label>
              <Input
                value={item.items ?? ''}
                onChange={(e) => onChange(i, { items: e.target.value })}
                placeholder="Python, TypeScript, Go, Rust"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-6 text-destructive"
            onClick={() => onDelete(i)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={onAdd} className="w-full">
        + Add skill category
      </Button>
    </div>
  )
}
