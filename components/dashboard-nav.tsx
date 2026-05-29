'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Target,
  BarChart3,
  Mic,
  Sparkles,
  CreditCard,
  LineChart,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/resumes', label: 'Resumes', icon: FileText },
  { href: '/dashboard/ats', label: 'ATS Check', icon: Target },
  { href: '/dashboard/tracker', label: 'Tracker', icon: BarChart3 },
  { href: '/dashboard/interview', label: 'Interview', icon: Mic },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
]

const ADMIN_NAV_ITEM = { href: '/dashboard/analytics', label: 'Analytics', icon: LineChart, exact: false }

export function Sidebar({ isVip = false, isAdmin = false }: { isVip?: boolean; isAdmin?: boolean }) {
  const pathname = usePathname()
  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-svh w-[220px] flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
          <Sparkles className="size-4" />
        </div>
        <span className="text-lg font-bold tracking-tight">JobUFO</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className={cn(
                  'size-[18px] transition-transform duration-200',
                  !isActive && 'group-hover:scale-110'
                )} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom pro card */}
      <div className="px-3 pb-4">
        {isVip ? (
          <Link
            href="/dashboard/billing"
            className="glow-border flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-foreground to-foreground/85 p-3.5 text-background transition-opacity hover:opacity-90"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/15">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold">Pro member</p>
              <p className="text-[11px] opacity-60">Manage billing</p>
            </div>
          </Link>
        ) : (
          <div className="glow-border rounded-xl bg-gradient-to-br from-foreground to-foreground/85 p-4 text-background">
            <p className="text-xs font-semibold">JobUFO Pro</p>
            <p className="mt-0.5 text-[11px] leading-relaxed opacity-60">
              Unlimited AI features &amp; priority support
            </p>
            <Link
              href="/dashboard/billing"
              className="mt-3 block w-full rounded-lg bg-background/15 py-1.5 text-center text-[11px] font-medium transition-colors hover:bg-background/25"
            >
              Upgrade
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 overflow-x-auto px-4 py-2.5 md:hidden border-b bg-card">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
              isActive
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <item.icon className="size-3.5" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
