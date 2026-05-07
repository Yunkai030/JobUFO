export interface Resume {
  id: string
  user_id: string
  title: string
  target_role: string | null
  template: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface PersonalInfo {
  id: string
  resume_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  location: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  summary: string | null
}

export interface WorkExperience {
  id: string
  resume_id: string
  company: string | null
  role: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  description: string | null
  sort_order: number
}

export interface Education {
  id: string
  resume_id: string
  institution: string | null
  degree: string | null
  field_of_study: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  gpa: string | null
  description: string | null
  sort_order: number
}

export interface Skill {
  id: string
  resume_id: string
  category: string | null
  items: string | null
  sort_order: number
}

export interface Project {
  id: string
  resume_id: string
  name: string | null
  url: string | null
  technologies: string | null
  description: string | null
  sort_order: number
}

export interface ResumeWithSections extends Resume {
  personal_info: PersonalInfo | null
  work_experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  projects: Project[]
}
