import { createClient } from '@/lib/supabase/server'
import { getResumes } from '@/lib/resume/queries'
import { ATSChecker } from '@/components/ats/ats-checker'

export default async function ATSPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const resumes = await getResumes()

  const { data: results } = await supabase
    .from('ats_results')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return <ATSChecker resumes={resumes} initialResults={results ?? []} />
}
