import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Welcome to JobUFO</h1>
      <p className="text-muted-foreground">
        Signed in as <span className="font-mono text-foreground">{user?.email}</span>.
      </p>
      <p className="text-sm text-muted-foreground">
        Resume builder, ATS check, and application tracker are coming next.
      </p>
    </div>
  )
}
