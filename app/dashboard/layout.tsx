import { redirect } from 'next/navigation'
import { signOut } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { getSubscription } from '@/lib/subscription/queries'
import { Sidebar, MobileNav } from '@/components/dashboard-nav'
import { LogOut, Sparkles } from 'lucide-react'

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

  const subscription = await getSubscription()

  return (
    <div className="min-h-svh bg-background">
      {/* Sidebar - desktop */}
      <div className="hidden md:block">
        <Sidebar isVip={subscription.isVip} />
      </div>

      {/* Mobile nav */}
      <MobileNav />

      {/* Main content */}
      <div className="md:pl-[220px]">
        {/* Top bar */}
        <header className="relative flex items-center justify-end border-b px-6 py-2.5 md:px-8">
          {/* Gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          <div className="flex items-center gap-3">
            {subscription.isVip && (
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
                <Sparkles className="size-3" />
                Pro
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="icon-sm">
                <LogOut className="size-3.5" />
              </Button>
            </form>
          </div>
        </header>

        <main className="px-6 py-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}
