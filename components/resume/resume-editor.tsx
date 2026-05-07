'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import type {
  ResumeWithSections,
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Project,
} from '@/lib/types/resume'
import {
  upsertPersonalInfo,
  addSectionItem,
  updateSectionItem,
  deleteSectionItem,
} from '@/lib/resume/actions'
import { useAutoSave, type SaveStatus } from '@/lib/hooks/use-auto-save'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PersonalInfoForm } from './personal-info-form'
import { ExperienceForm } from './experience-form'
import { EducationForm } from './education-form'
import { SkillsForm } from './skills-form'
import { ProjectsForm } from './projects-form'
import { ResumePreview } from './resume-preview'
import { updateResume } from '@/lib/resume/actions'

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving...',
  saved: 'Saved',
  error: 'Save failed',
}

export function ResumeEditor({ initial }: { initial: ResumeWithSections }) {
  const [resume, setResume] = useState(initial)
  const { status, trigger } = useAutoSave()
  const [exporting, startExport] = useTransition()

  const handleExportPDF = () => {
    startExport(async () => {
      const { pdf } = await import('@react-pdf/renderer')
      const { ResumePDF } = await import('./resume-pdf')
      const blob = await pdf(<ResumePDF resume={resume} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resume.title || 'resume'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  // ── title ──────────────────────────────────────────────────
  const handleTitleChange = (title: string) => {
    setResume((r) => ({ ...r, title }))
    trigger(() => updateResume(resume.id, { title }))
  }

  // ── personal info ──────────────────────────────────────────
  const handlePIChange = useCallback(
    (fields: Partial<PersonalInfo>) => {
      setResume((r) => ({
        ...r,
        personal_info: r.personal_info ? { ...r.personal_info, ...fields } : null,
      }))
      trigger(() => upsertPersonalInfo(resume.id, fields))
    },
    [resume.id, trigger]
  )

  // ── generic list helpers ───────────────────────────────────
  function makeListHandlers<T extends { id: string }>(
    key: 'work_experience' | 'education' | 'skills' | 'projects',
    table: 'work_experience' | 'education' | 'skills' | 'projects'
  ) {
    const onChange = (index: number, fields: Partial<T>) => {
      setResume((r) => {
        const list = [...(r[key] as T[])]
        list[index] = { ...list[index], ...fields }
        return { ...r, [key]: list }
      })
      const itemId = (resume[key] as T[])[index]?.id
      if (itemId) {
        trigger(() => updateSectionItem(table, itemId, fields as Record<string, unknown>))
      }
    }

    const onAdd = async () => {
      const newId = await addSectionItem(table, resume.id)
      setResume((r) => {
        const list = r[key] as T[]
        const newItem = {
          id: newId,
          resume_id: resume.id,
          sort_order: list.length,
        } as T
        return { ...r, [key]: [...list, newItem] }
      })
    }

    const onDelete = async (index: number) => {
      const list = resume[key] as T[]
      const itemId = list[index]?.id
      if (!itemId) return
      setResume((r) => ({
        ...r,
        [key]: (r[key] as T[]).filter((_, i) => i !== index),
      }))
      await deleteSectionItem(table, itemId)
    }

    return { onChange, onAdd, onDelete }
  }

  const experience = makeListHandlers<WorkExperience>('work_experience', 'work_experience')
  const education = makeListHandlers<Education>('education', 'education')
  const skills = makeListHandlers<Skill>('skills', 'skills')
  const projects = makeListHandlers<Project>('projects', 'projects')

  return (
    <div className="flex h-[calc(100svh-57px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-background px-4 py-2">
        <Link href="/dashboard/resumes">
          <Button variant="ghost" size="sm">
            &larr; Back
          </Button>
        </Link>
        <Input
          value={resume.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="max-w-xs border-none bg-transparent text-base font-medium shadow-none focus-visible:ring-0"
        />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {STATUS_LABEL[status]}
          </span>
          <Button size="sm" onClick={handleExportPDF} disabled={exporting}>
            {exporting ? 'Generating…' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Body: editor + preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-8">
            <FormSection title="Personal Information">
              {resume.personal_info && (
                <PersonalInfoForm
                  data={resume.personal_info}
                  onChange={handlePIChange}
                />
              )}
            </FormSection>

            <FormSection title="Work Experience">
              <ExperienceForm
                items={resume.work_experience}
                onChange={experience.onChange}
                onAdd={experience.onAdd}
                onDelete={experience.onDelete}
              />
            </FormSection>

            <FormSection title="Education">
              <EducationForm
                items={resume.education}
                onChange={education.onChange}
                onAdd={education.onAdd}
                onDelete={education.onDelete}
              />
            </FormSection>

            <FormSection title="Skills">
              <SkillsForm
                items={resume.skills}
                onChange={skills.onChange}
                onAdd={skills.onAdd}
                onDelete={skills.onDelete}
              />
            </FormSection>

            <FormSection title="Projects">
              <ProjectsForm
                items={resume.projects}
                onChange={projects.onChange}
                onAdd={projects.onAdd}
                onDelete={projects.onDelete}
              />
            </FormSection>
          </div>
        </div>

        {/* Right — Preview */}
        <div className="hidden w-[420px] shrink-0 overflow-y-auto border-l bg-muted/30 p-4 lg:block">
          <div className="sticky top-0">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>
    </div>
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}
