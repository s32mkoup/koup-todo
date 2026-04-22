'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Overview', slug: null },
  { label: 'Homework', slug: 'homework' },
  { label: 'Exams', slug: 'exams' },
  { label: 'Notes', slug: 'notes' },
  { label: 'Teammates', slug: 'teammates' },
  { label: 'Grades', slug: 'grades' },
  { label: 'Calendar', slug: 'calendar' },
] as const

type Props = {
  courseId: string
  courseColor: string
}

export default function CourseTabBar({ courseId, courseColor }: Props) {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        gap: 4,
        overflowX: 'auto',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 4,
        paddingBottom: 4,
        background: 'rgba(15,19,31,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        scrollbarWidth: 'none',
      }}
    >
      {TABS.map((tab) => {
        const href = tab.slug
          ? `/courses/${courseId}/${tab.slug}`
          : `/courses/${courseId}`

        const isActive = tab.slug
          ? pathname === href || pathname.startsWith(`${href}/`)
          : pathname === href

        return (
          <Link
            key={tab.label}
            href={href}
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              background: isActive ? `${courseColor}22` : 'transparent',
              color: isActive ? '#DFE2F3' : 'rgba(223,226,243,0.40)',
              borderBottom: `2px solid ${isActive ? courseColor : 'transparent'}`,
              borderRadius: isActive ? '12px 12px 0 0' : '12px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease, background 150ms ease',
            }}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
