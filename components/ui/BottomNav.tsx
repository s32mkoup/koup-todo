'use client'

import type { LucideIcon } from 'lucide-react'
import { BookOpen, CalendarDays, CheckSquare, Home, UserRound } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/home',    label: 'Home',    icon: Home },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/planner', label: 'Planner', icon: CalendarDays },
  { href: '/todo',    label: 'Todo',    icon: CheckSquare },
  { href: '/profile', label: 'Profile', icon: UserRound },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        minHeight: 64,
        paddingTop: 8,
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
        paddingLeft: 8,
        paddingRight: 8,
        background: 'rgba(15, 19, 31, 0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(74, 69, 79, 0.20)',
      }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href || (href !== '/home' && pathname.startsWith(href))

        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              width: 56,
              height: 52,
              borderRadius: 16,
              color: isActive ? '#D6BAFF' : 'rgba(223,226,243,0.40)',
              textDecoration: 'none',
              transition: 'transform 150ms ease-out',
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            <span
              style={{
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                fontSize: 10,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.03em',
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
