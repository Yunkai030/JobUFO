import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">JobUFO</h1>
        <p className="max-w-md text-base text-muted-foreground">
          Resume builder, ATS checker, auto-fill, application tracker — your entire
          job-hunting workflow in one place.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
          Get started — free
        </Link>
        <Link
          href="/login"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          Log in
        </Link>
      </div>
    </div>
  )
}
