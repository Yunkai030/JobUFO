'use client'

import type { ResumeWithSections } from '@/lib/types/resume'

interface Props {
  resume: ResumeWithSections
}

export function ResumePreview({ resume }: Props) {
  const pi = resume.personal_info

  return (
    <div className="aspect-[1/1.414] w-full overflow-hidden rounded-lg border bg-white text-black shadow-sm">
      <div className="h-full overflow-y-auto p-6 text-[10px] leading-relaxed">
        {/* Header */}
        <div className="mb-3 text-center">
          {pi?.full_name && (
            <h1 className="text-lg font-bold leading-tight">{pi.full_name}</h1>
          )}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-gray-600">
            {pi?.email && <span>{pi.email}</span>}
            {pi?.phone && <span>{pi.phone}</span>}
            {pi?.location && <span>{pi.location}</span>}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center justify-center gap-x-2 text-gray-500">
            {pi?.linkedin_url && <span>{pi.linkedin_url}</span>}
            {pi?.github_url && <span>{pi.github_url}</span>}
            {pi?.portfolio_url && <span>{pi.portfolio_url}</span>}
          </div>
        </div>

        {/* Summary */}
        {pi?.summary && (
          <Section title="Summary">
            <p className="whitespace-pre-wrap">{pi.summary}</p>
          </Section>
        )}

        {/* Experience */}
        {resume.work_experience.length > 0 && (
          <Section title="Experience">
            {resume.work_experience.map((exp) => (
              <div key={exp.id} className="mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">
                    {exp.role}
                    {exp.company ? ` — ${exp.company}` : ''}
                  </span>
                  <span className="text-gray-500 shrink-0 ml-2">
                    {exp.start_date}
                    {(exp.end_date || exp.is_current) &&
                      ` – ${exp.is_current ? 'Present' : exp.end_date}`}
                  </span>
                </div>
                {exp.location && (
                  <div className="text-gray-500">{exp.location}</div>
                )}
                {exp.description && (
                  <p className="mt-0.5 whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <Section title="Education">
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">
                    {edu.degree}
                    {edu.field_of_study ? `, ${edu.field_of_study}` : ''}
                  </span>
                  <span className="text-gray-500 shrink-0 ml-2">
                    {edu.start_date}
                    {edu.end_date && ` – ${edu.end_date}`}
                  </span>
                </div>
                <div className="text-gray-600">
                  {edu.institution}
                  {edu.location ? ` — ${edu.location}` : ''}
                  {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                </div>
                {edu.description && (
                  <p className="mt-0.5 whitespace-pre-wrap">{edu.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <Section title="Skills">
            {resume.skills.map((skill) => (
              <div key={skill.id} className="mb-1">
                {skill.category && (
                  <span className="font-semibold">{skill.category}: </span>
                )}
                <span>{skill.items}</span>
              </div>
            ))}
          </Section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <Section title="Projects">
            {resume.projects.map((proj) => (
              <div key={proj.id} className="mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{proj.name}</span>
                  {proj.url && (
                    <span className="text-gray-500 shrink-0 ml-2">{proj.url}</span>
                  )}
                </div>
                {proj.technologies && (
                  <div className="text-gray-500">{proj.technologies}</div>
                )}
                {proj.description && (
                  <p className="mt-0.5 whitespace-pre-wrap">{proj.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h2 className="mb-1 border-b border-gray-300 pb-0.5 text-xs font-bold uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  )
}
