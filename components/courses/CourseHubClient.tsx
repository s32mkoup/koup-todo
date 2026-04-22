'use client'

import { Clock, BookOpen, GraduationCap } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import CourseTabBar from '@/components/courses/CourseTabBar'
import type { CourseWithSchedules } from '@/lib/supabase/queries/courses'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Props = {
  course: CourseWithSchedules
  homeworkCount: number
  examCount: number
}

function formatTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

function getNextClass(schedules: CourseWithSchedules['course_schedules']) {
  if (!schedules.length) return null

  const todayDOW = (new Date().getDay() + 6) % 7 // Convert JS 0=Sun → 0=Mon

  const sorted = [...schedules].sort((a, b) => {
    const aDist = (a.day_of_week - todayDOW + 7) % 7
    const bDist = (b.day_of_week - todayDOW + 7) % 7
    if (aDist !== bDist) return aDist - bDist
    return (a.start_time ?? '').localeCompare(b.start_time ?? '')
  })

  const next = sorted[0]
  const isToday = next.day_of_week === todayDOW
  return {
    label: isToday ? 'Today' : DAYS[next.day_of_week],
    day: DAYS[next.day_of_week],
    start: formatTime(next.start_time),
    end: formatTime(next.end_time),
    isToday,
  }
}

export default function CourseHubClient({ course, homeworkCount, examCount }: Props) {
  const nextClass = getNextClass(course.course_schedules)
  const courseColor = course.color ?? '#7B5EA7'

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column', background: '#0F131F' }}>
      {/* Header with color gradient */}
      <div
        style={{
          position: 'relative',
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 16,
          paddingBottom: 24,
          background: `radial-gradient(ellipse at top left, ${courseColor}28 0%, transparent 65%), #0F131F`,
        }}
      >
        <PageHeader
          title={course.name}
          subtitle={[course.code, course.professor].filter(Boolean).join(' · ')}
          backHref="/courses"
        />

        {/* Color accent strip */}
        <div
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 4,
            height: 2,
            borderRadius: 9999,
            opacity: 0.4,
            background: courseColor,
          }}
        />
      </div>

      <CourseTabBar courseId={course.id} courseColor={courseColor} />

      {/* Tab content */}
      <div style={{ flex: 1, paddingLeft: 20, paddingRight: 20, paddingBottom: 128, paddingTop: 16 }}>
        <OverviewTab
          course={course}
          nextClass={nextClass}
          homeworkCount={homeworkCount}
          examCount={examCount}
          courseColor={courseColor}
        />
      </div>
    </div>
  )
}

type OverviewTabProps = {
  course: CourseWithSchedules
  nextClass: ReturnType<typeof getNextClass>
  homeworkCount: number
  examCount: number
  courseColor: string
}

function OverviewTab({ course, nextClass, homeworkCount, examCount, courseColor }: OverviewTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Next class card */}
      <div style={{ borderRadius: 16, padding: 20, background: '#1B1F2C' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Clock size={15} strokeWidth={1.8} style={{ color: 'rgba(223,226,243,0.40)' }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: 'rgba(223,226,243,0.40)',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            }}
          >
            NEXT CLASS
          </span>
        </div>

        {nextClass ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: '1.2',
                  color: '#DFE2F3',
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                  letterSpacing: '-0.02em',
                }}
              >
                {nextClass.label}
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 14,
                  color: 'rgba(223,226,243,0.60)',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                }}
              >
                {nextClass.start && nextClass.end
                  ? `${nextClass.start} – ${nextClass.end}`
                  : nextClass.start || 'Time TBD'}
              </p>
              {course.room && (
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: 12,
                    color: 'rgba(223,226,243,0.40)',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  }}
                >
                  {course.room}
                </p>
              )}
            </div>
            {nextClass.isToday && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative', height: 8, width: 8 }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 9999,
                      background: '#41E4C0',
                    }}
                  />
                  <div
                    className="animate-ping"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 9999,
                      background: 'rgba(65,228,192,0.35)',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#41E4C0',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  }}
                >
                  Today
                </span>
              </div>
            )}
          </div>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'rgba(223,226,243,0.40)',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            }}
          >
            No schedule added yet
          </p>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatCard
          icon={<BookOpen size={18} strokeWidth={1.8} />}
          label="Pending HW"
          value={homeworkCount}
          color={courseColor}
        />
        <StatCard
          icon={<GraduationCap size={18} strokeWidth={1.8} />}
          label="Exams"
          value={examCount}
          color="#FFB955"
        />
      </div>

      {/* Schedule list */}
      {course.course_schedules.length > 0 && (
        <div style={{ borderRadius: 16, padding: 20, background: '#1B1F2C' }}>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: 'rgba(223,226,243,0.40)',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            }}
          >
            WEEKLY SCHEDULE
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...course.course_schedules]
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((slot) => (
                <div key={slot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        height: 32,
                        width: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        background: `${courseColor}18`,
                        color: courseColor,
                        fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      }}
                    >
                      {DAYS[slot.day_of_week].slice(0, 2)}
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        color: '#DFE2F3',
                        fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      }}
                    >
                      {DAYS[slot.day_of_week]}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      color: 'rgba(223,226,243,0.50)',
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    }}
                  >
                    {slot.start_time && slot.end_time
                      ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                      : '—'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Course info */}
      <div style={{ borderRadius: 16, padding: 20, background: '#1B1F2C' }}>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.05em',
            color: 'rgba(223,226,243,0.40)',
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          }}
        >
          COURSE INFO
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Code', value: course.code },
            { label: 'Professor', value: course.professor },
            { label: 'Room', value: course.room },
            {
              label: 'Semester',
              value:
                course.semester_start && course.semester_end
                  ? `${formatDate(course.semester_start)} – ${formatDate(course.semester_end)}`
                  : null,
            },
          ]
            .filter((row) => row.value)
            .map((row) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 14,
                    color: 'rgba(223,226,243,0.40)',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#DFE2F3',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 16, padding: 16, background: '#1B1F2C' }}>
      <div style={{ color }}>{icon}</div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            color: '#DFE2F3',
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </p>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: 'rgba(223,226,243,0.40)',
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          }}
        >
          {label.toUpperCase()}
        </p>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
