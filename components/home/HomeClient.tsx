'use client'

import { useEffect, useMemo, useState } from 'react'
import CountdownBadge from '@/components/ui/CountdownBadge'
import { formatDisplayTime } from '@/lib/utils/calendar'

export type HomeClass = {
  id: string
  courseId: string
  courseName: string
  courseColor: string
  startTime: string
  endTime: string
  room: string | null
}

export type HomeHomework = {
  id: string
  title: string
  deadline: string
  courseName: string
}

export type HomeExam = {
  id: string
  title: string
  examDate: string
  courseName: string
}

export type HomeTodo = {
  id: string
  title: string
  dueAt: string
  priority: string
}

type HomeClientProps = {
  name: string
  initialNowIso: string
  todaysClasses: HomeClass[]
  homeworkDueToday: HomeHomework[]
  upcomingExams: HomeExam[]
  urgentTodos: HomeTodo[]
}

const colors = {
  surface: '#0F131F',
  card: '#1B1F2C',
  text: '#DFE2F3',
  muted: 'rgba(223,226,243,0.60)',
  dim: 'rgba(223,226,243,0.50)',
  disabled: 'rgba(223,226,243,0.30)',
  teal: '#41E4C0',
  amber: '#FFB955',
  coral: '#FF6B6B',
  violet: '#7B5EA7',
}

function getGreeting(date: Date): string {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date).toUpperCase()
}

function formatDueTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

function formatFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'Erfan'
}

function priorityColor(priority: string): { background: string; color: string } {
  if (priority === 'high') return { background: 'rgba(255,107,107,0.15)', color: colors.coral }
  if (priority === 'low') return { background: 'rgba(65,228,192,0.15)', color: colors.teal }
  return { background: 'rgba(255,185,85,0.15)', color: colors.amber }
}

// ─── Section heading with teal accent bar ────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          width: 2,
          height: 14,
          borderRadius: 2,
          background: colors.teal,
          flexShrink: 0,
        }}
      />
      <h2
        style={{
          margin: 0,
          color: colors.dim,
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        {children}
      </h2>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        background: colors.card,
        borderRadius: 16,
        border: '1px solid rgba(74,69,79,0.20)',
        padding: 20,
        textAlign: 'center',
        color: colors.muted,
        fontFamily: 'var(--font-manrope), Manrope, sans-serif',
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      {message}
    </div>
  )
}

// ─── Accent bar (left colored stripe inside a card) ──────────────────────────

function AccentBar({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: '0 auto 0 0',
        width: 3,
        background: color,
        borderRadius: '16px 0 0 16px',
      }}
    />
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomeClient({
  name,
  initialNowIso,
  todaysClasses,
  homeworkDueToday,
  upcomingExams,
  urgentTodos,
}: HomeClientProps) {
  const [now, setNow] = useState(() => new Date(initialNowIso))
  const firstName = useMemo(() => formatFirstName(name), [name])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: colors.surface,
        color: colors.text,
        padding: '24px 20px 112px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'relative',
          paddingTop: 32,
          paddingBottom: 8,
          background: 'radial-gradient(ellipse at top left, rgba(123,94,167,0.15) 0%, transparent 70%)',
          borderRadius: 20,
        }}
      >
        {/* Date label */}
        <p
          style={{
            margin: '0 0 10px',
            color: 'rgba(223,226,243,0.50)',
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            lineHeight: 1.4,
            textTransform: 'uppercase',
          }}
        >
          {formatDateLabel(now)}
        </p>

        {/* Greeting + Clock row */}
        <div style={{ position: 'relative' }}>
          <h1
            style={{
              margin: 0,
              paddingRight: 110,
              color: colors.text,
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {getGreeting(now)}, {firstName}
          </h1>

          <time
            dateTime={now.toISOString()}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: colors.teal,
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            {formatClock(now)}
          </time>
        </div>
      </header>

      {/* ── Today's Classes ─────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Today&apos;s Classes</SectionTitle>
        {todaysClasses.length > 0 ? (
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginLeft: -20,
              marginRight: -20,
              overflowX: 'auto',
              padding: '0 20px 4px',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
            }}
          >
            {todaysClasses.map((item) => (
              <article
                key={item.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  flex: '0 0 180px',
                  minWidth: 180,
                  background: colors.card,
                  borderRadius: 16,
                  border: '1px solid rgba(74,69,79,0.20)',
                  padding: '16px 16px 16px 20px',
                  scrollSnapAlign: 'start',
                }}
              >
                <AccentBar color={item.courseColor} />
                <h3
                  style={{
                    margin: 0,
                    color: colors.text,
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}
                >
                  {item.courseName}
                </h3>
                <p
                  style={{
                    margin: '10px 0 0',
                    color: colors.muted,
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  {formatDisplayTime(item.startTime)} – {formatDisplayTime(item.endTime)}
                </p>
                <p
                  style={{
                    margin: '6px 0 0',
                    color: item.room ? colors.muted : colors.disabled,
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {item.room ?? 'No room set'}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="No classes today." />
        )}
      </section>

      {/* ── Due Today ───────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Due Today</SectionTitle>
        {homeworkDueToday.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {homeworkDueToday.map((item) => (
              <article
                key={item.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: colors.card,
                  borderRadius: 12,
                  border: '1px solid rgba(74,69,79,0.20)',
                  padding: '12px 16px 12px 20px',
                }}
              >
                <AccentBar color={colors.amber} />
                <h3
                  style={{
                    margin: 0,
                    color: colors.text,
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    margin: '4px 0 0',
                    color: colors.muted,
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {item.courseName}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="Nothing due today." />
        )}
      </section>

      {/* ── Upcoming Exams ──────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Upcoming Exams</SectionTitle>
        {upcomingExams.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingExams.map((item) => (
              <article
                key={item.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: colors.card,
                  borderRadius: 12,
                  border: '1px solid rgba(74,69,79,0.20)',
                  padding: '12px 16px 12px 20px',
                }}
              >
                <AccentBar color={colors.coral} />
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      color: colors.text,
                      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      margin: '4px 0 0',
                      color: colors.muted,
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.courseName}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <CountdownBadge targetDate={new Date(item.examDate)} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="No exams in the next 7 days." />
        )}
      </section>

      {/* ── Urgent Todos ────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Urgent Todos</SectionTitle>
        {urgentTodos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {urgentTodos.map((item) => {
              const pColor = priorityColor(item.priority)
              return (
                <article
                  key={item.id}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    background: colors.card,
                    borderRadius: 12,
                    border: '1px solid rgba(74,69,79,0.20)',
                    padding: '12px 16px 12px 20px',
                  }}
                >
                  <AccentBar color={pColor.color} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 6,
                        background: pColor.background,
                        color: pColor.color,
                        fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        lineHeight: 1,
                        padding: '4px 8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.priority}
                    </span>
                    <h3
                      style={{
                        margin: '6px 0 0',
                        color: colors.text,
                        fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                        fontSize: 15,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <time
                    dateTime={item.dueAt}
                    style={{
                      flexShrink: 0,
                      color: colors.muted,
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {formatDueTime(item.dueAt)}
                  </time>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyState message="Nothing urgent right now." />
        )}
      </section>
    </main>
  )
}
