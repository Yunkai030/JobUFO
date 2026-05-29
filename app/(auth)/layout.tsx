import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background">
          <Sparkles className="size-4" />
        </div>
        <span className="text-xl font-bold tracking-tight">JobUFO</span>
      </Link>
      {children}
    </div>
  )
}
