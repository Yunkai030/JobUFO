import { redirect } from 'next/navigation'
import { signOut } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="flex items-center justify-between border-b bg-background px-6 py-3">
        <div className="font-medium">JobUFO</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
