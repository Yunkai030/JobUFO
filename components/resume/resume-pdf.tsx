'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { ResumeWithSections } from '@/lib/types/resume'

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
})

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: '36 40',
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  // header
  headerName: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 1,
  },
  headerText: { fontSize: 9, color: '#555' },
  // section
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    paddingBottom: 2,
    marginTop: 10,
    marginBottom: 4,
  },
  // entries
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  entryTitle: { fontSize: 10, fontWeight: 'bold' },
  entryDate: { fontSize: 9, color: '#555' },
  entrySubtitle: { fontSize: 9, color: '#444', marginBottom: 2 },
  entryDesc: { fontSize: 9.5, color: '#333', marginBottom: 4 },
  // skills
  skillRow: { flexDirection: 'row', marginBottom: 2 },
  skillCategory: { fontSize: 10, fontWeight: 'bold', width: 120 },
  skillItems: { fontSize: 9.5, color: '#333', flex: 1 },
})

export function ResumePDF({ resume }: { resume: ResumeWithSections }) {
  const pi = resume.personal_info

  return (
    <Document title={resume.title} author={pi?.full_name ?? ''}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        {pi?.full_name && <Text style={s.headerName}>{pi.full_name}</Text>}
        <View style={s.headerRow}>
          {pi?.email && <Text style={s.headerText}>{pi.email}</Text>}
          {pi?.phone && <Text style={s.headerText}>{pi.phone}</Text>}
          {pi?.location && <Text style={s.headerText}>{pi.location}</Text>}
        </View>
        <View style={s.headerRow}>
          {pi?.linkedin_url && <Text style={s.headerText}>{pi.linkedin_url}</Text>}
          {pi?.github_url && <Text style={s.headerText}>{pi.github_url}</Text>}
          {pi?.portfolio_url && <Text style={s.headerText}>{pi.portfolio_url}</Text>}
        </View>

        {/* Summary */}
        {pi?.summary && (
          <>
            <Text style={s.sectionTitle}>Summary</Text>
            <Text style={s.entryDesc}>{pi.summary}</Text>
          </>
        )}

        {/* Experience */}
        {resume.work_experience.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Experience</Text>
            {resume.work_experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 6 }}>
                <View style={s.entryHeader}>
                  <Text style={s.entryTitle}>
                    {exp.role}
                    {exp.company ? ` — ${exp.company}` : ''}
                  </Text>
                  <Text style={s.entryDate}>
                    {exp.start_date}
                    {(exp.end_date || exp.is_current) &&
                      ` – ${exp.is_current ? 'Present' : exp.end_date}`}
                  </Text>
                </View>
                {exp.location && <Text style={s.entrySubtitle}>{exp.location}</Text>}
                {exp.description && <Text style={s.entryDesc}>{exp.description}</Text>}
              </View>
            ))}
          </>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Education</Text>
            {resume.education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={s.entryHeader}>
                  <Text style={s.entryTitle}>
                    {edu.degree}
                    {edu.field_of_study ? `, ${edu.field_of_study}` : ''}
                  </Text>
                  <Text style={s.entryDate}>
                    {edu.start_date}
                    {edu.end_date && ` – ${edu.end_date}`}
                  </Text>
                </View>
                <Text style={s.entrySubtitle}>
                  {edu.institution}
                  {edu.location ? ` — ${edu.location}` : ''}
                  {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                </Text>
                {edu.description && <Text style={s.entryDesc}>{edu.description}</Text>}
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Skills</Text>
            {resume.skills.map((skill) => (
              <View key={skill.id} style={s.skillRow}>
                {skill.category && (
                  <Text style={s.skillCategory}>{skill.category}:</Text>
                )}
                <Text style={s.skillItems}>{skill.items}</Text>
              </View>
            ))}
          </>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Projects</Text>
            {resume.projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 6 }}>
                <View style={s.entryHeader}>
                  <Text style={s.entryTitle}>{proj.name}</Text>
                  {proj.url && <Text style={s.entryDate}>{proj.url}</Text>}
                </View>
                {proj.technologies && (
                  <Text style={s.entrySubtitle}>{proj.technologies}</Text>
                )}
                {proj.description && <Text style={s.entryDesc}>{proj.description}</Text>}
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}
