'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import type { CalendarOccurrence } from '@/lib/utils/calendar'
import {
  generateCourseOccurrences,
  getWeekDays,
  toDateKey,
  isoToDateKey,
  timeToDecimalHours,
  formatDisplayTime,
  WEEK_DAYS_SHORT,
  MONTH_NAMES,
} from '@/lib/utils/calendar'

// ─── Types (exported for server component) ─────────────────────────────────

export type CourseForPlanner = {
  id: string
  name: string
  color: string
  room: string | null
  semester_start: string
  semester_end: string
  course_schedules: Array<{
    id: string
    day_of_week: number
    start_time: string | null
    end_time: string | null
  }>
}

export type HomeworkForPlanner = {
  id: string
  title: string
  deadline: string
  course_id: string
}

export type ExamForPlanner = {
  id: string
  title: string
  exam_date: string
  course_id: string
}

type Props = {
  courses: CourseForPlanner[]
  homework: HomeworkForPlanner[]
  exams: ExamForPlanner[]
}

// ─── Grid constants ─────────────────────────────────────────────────────────

const START_HOUR = 8
const END_HOUR = 24
const HOUR_HEIGHT = 60
const TOTAL_HOURS = END_HOUR - START_HOUR
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT
const TIME_COL_WIDTH = 52
const DAY_COL_MIN_WIDTH = 100

const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i)
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function formatWeekLabel(weekDays: Date[]): string {
  const first = weekDays[0]
  const last = weekDays[6]
  const fm = MONTH_NAMES[first.getMonth()].slice(0, 3)
  const lm = MONTH_NAMES[last.getMonth()].slice(0, 3)
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()}–${last.getDate()} ${fm} ${first.getFullYear()}`
  }
  if (first.getFullYear() === last.getFullYear()) {
    return `${first.getDate()} ${fm} – ${last.getDate()} ${lm} ${first.getFullYear()}`
  }
  return `${first.getDate()} ${fm} ${first.getFullYear()} – ${last.getDate()} ${lm} ${last.getFullYear()}`
}

function formatDayLabel(date: Date): string {
  const dow = (date.getDay() + 6) % 7
  return `${FULL_DAYS[dow]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PlannerClient({ courses, homework, exams }: Props) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => toDateKey(new Date()))
  const gridScrollRef = useRef<HTMLDivElement | null>(null)

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])
  const todayKey = toDateKey(new Date())

  // Reset page scroll on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Reset grid scrollTop to 0 on mount and on week change
  useEffect(() => {
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 0
    }
  }, [currentDate])

  function prevWeek() {
    setCurrentDate((d) => {
      const nd = new Date(d)
      nd.setDate(nd.getDate() - 7)
      return nd
    })
  }

  function nextWeek() {
    setCurrentDate((d) => {
      const nd = new Date(d)
      nd.setDate(nd.getDate() + 7)
      return nd
    })
  }

  // Build occurrence map
  const occurrencesByDate = useMemo(() => {
    const map = new Map<string, CalendarOccurrence[]>()
    for (const course of courses) {
      const occs = generateCourseOccurrences(course, course.course_schedules)
      for (const occ of occs) {
        const key = toDateKey(occ.date)
        const existing = map.get(key)
        if (existing) existing.push(occ)
        else map.set(key, [occ])
      }
    }
    return map
  }, [courses])

  // Build homework map
  const hwByDate = useMemo(() => {
    const map = new Map<string, HomeworkForPlanner[]>()
    for (const hw of homework) {
      const key = isoToDateKey(hw.deadline)
      const existing = map.get(key)
      if (existing) existing.push(hw)
      else map.set(key, [hw])
    }
    return map
  }, [homework])

  // Build exam map
  const examsByDate = useMemo(() => {
    const map = new Map<string, ExamForPlanner[]>()
    for (const exam of exams) {
      const key = isoToDateKey(exam.exam_date)
      const existing = map.get(key)
      if (existing) existing.push(exam)
      else map.set(key, [exam])
    }
    return map
  }, [exams])

  // Course lookup for Day Detail
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  // Selected day data
  const selectedOccs = occurrencesByDate.get(selectedDayKey) ?? []
  const selectedHw = hwByDate.get(selectedDayKey) ?? []
  const selectedExams = examsByDate.get(selectedDayKey) ?? []
  const selectedDate = useMemo(() => {
    const [y, m, d] = selectedDayKey.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [selectedDayKey])

  return (
    <div style={{ minHeight: '100dvh', background: '#0F131F', color: '#DFE2F3' }}>
      <PageHeader title="Planner" />

      {/* Week navigation */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px 12px',
          background: 'rgba(15,19,31,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <button onClick={prevWeek} style={navBtnStyle} aria-label="Previous week">
          <ChevronLeft size={20} strokeWidth={1.8} />
        </button>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
            letterSpacing: '-0.01em',
            color: '#DFE2F3',
          }}
        >
          {formatWeekLabel(weekDays)}
        </span>
        <button onClick={nextWeek} style={navBtnStyle} aria-label="Next week">
          <ChevronRight size={20} strokeWidth={1.8} />
        </button>
      </div>

      {/* Horizontally + vertically scrollable grid — height reduced to make room for Day Detail */}
      <div
        ref={gridScrollRef}
        style={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: 'calc(100dvh - 340px)',
        }}
      >
        <div style={{ minWidth: TIME_COL_WIDTH + 7 * DAY_COL_MIN_WIDTH }}>

          {/* Day headers */}
          <div
            style={{
              display: 'flex',
              paddingTop: 6,
              paddingBottom: 6,
              background: 'rgba(15,19,31,0.92)',
              position: 'sticky',
              top: 0,
              zIndex: 5,
            }}
          >
            <div style={{ width: TIME_COL_WIDTH, flexShrink: 0 }} />

            {weekDays.map((day, i) => {
              const dateKey = toDateKey(day)
              const isToday = dateKey === todayKey
              const isSelected = dateKey === selectedDayKey
              const dayHw = hwByDate.get(dateKey) ?? []
              const dayExams = examsByDate.get(dateKey) ?? []
              const dayOccs = occurrencesByDate.get(dateKey) ?? []

              // Combined badge list: exams first (more urgent), then hw. Max 2 shown.
              type BadgeItem = { id: string; title: string; course_id: string; kind: 'exam' | 'hw' }
              const combined: BadgeItem[] = [
                ...dayExams.map((e) => ({ id: e.id, title: e.title, course_id: e.course_id, kind: 'exam' as const })),
                ...dayHw.map((h) => ({ id: h.id, title: h.title, course_id: h.course_id, kind: 'hw' as const })),
              ]
              const shown = combined.slice(0, 2)
              const remaining = combined.length - 2

              // Dot indicators (up to 3): course color, amber if hw, coral if exam
              const dots = [
                ...(dayOccs.length > 0 ? [dayOccs[0].course_color] : []),
                ...(dayHw.length > 0 ? ['#FFB955'] : []),
                ...(dayExams.length > 0 ? ['#FF6B6B'] : []),
              ].slice(0, 3)

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDayKey(dateKey)}
                  style={{
                    flex: 1,
                    minWidth: DAY_COL_MIN_WIDTH,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    padding: '4px 2px 6px',
                    background: isSelected ? 'rgba(123,94,167,0.20)' : 'transparent',
                    borderRadius: 12,
                    cursor: 'pointer',
                  }}
                >
                  {/* Day name */}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      color: isSelected ? '#D6BAFF' : isToday ? '#D6BAFF' : 'rgba(223,226,243,0.40)',
                    }}
                  >
                    {WEEK_DAYS_SHORT[i]}
                  </span>

                  {/* Date number */}
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                      fontWeight: isToday ? 700 : isSelected ? 600 : 400,
                      background: isToday ? '#7B5EA7' : 'transparent',
                      color: isSelected && !isToday ? '#D6BAFF' : isToday ? '#DFE2F3' : 'rgba(223,226,243,0.65)',
                    }}
                  >
                    {day.getDate()}
                  </span>

                  {/* Dot indicators */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 6 }}>
                    {dots.map((color, dotIdx) => (
                      <span
                        key={dotIdx}
                        style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }}
                      />
                    ))}
                  </div>

                  {/* Badge area */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', paddingLeft: 2, paddingRight: 2 }}>
                    {shown.map((item) => (
                      <HeaderBadge
                        key={item.id}
                        title={truncate(item.title, 12)}
                        background={item.kind === 'exam' ? 'rgba(255,107,107,0.20)' : 'rgba(255,185,85,0.20)'}
                        color={item.kind === 'exam' ? '#FF6B6B' : '#FFB955'}
                        border={item.kind === 'exam' ? '1px solid rgba(255,107,107,0.50)' : '1px solid rgba(255,185,85,0.50)'}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.kind === 'hw') router.push(`/courses/${item.course_id}/homework`)
                          else router.push(`/courses/${item.course_id}/exams`)
                        }}
                      />
                    ))}
                    {remaining > 0 && (
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: 10,
                          fontWeight: 500,
                          color: 'rgba(223,226,243,0.35)',
                          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                        }}
                      >
                        +{remaining} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grid body */}
          <div style={{ display: 'flex' }}>

            {/* Time labels */}
            <div style={{ width: TIME_COL_WIDTH, flexShrink: 0 }}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{
                    height: HOUR_HEIGHT,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    paddingRight: 8,
                    paddingTop: 5,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: 'rgba(223,226,243,0.28)',
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      letterSpacing: '0.03em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatHour(h)}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIdx) => {
              const dateKey = toDateKey(day)
              const dayOccs = occurrencesByDate.get(dateKey) ?? []
              const isToday = dateKey === todayKey
              const isSelected = dateKey === selectedDayKey

              return (
                <div
                  key={dayIdx}
                  style={{
                    flex: 1,
                    minWidth: DAY_COL_MIN_WIDTH,
                    position: 'relative',
                    height: GRID_HEIGHT,
                    borderLeft: '1px solid rgba(255,255,255,0.04)',
                    background: isSelected
                      ? 'rgba(123,94,167,0.10)'
                      : isToday
                      ? 'rgba(123,94,167,0.03)'
                      : 'transparent',
                  }}
                >
                  {/* Hour gridlines */}
                  {HOURS.map((_, hIdx) => (
                    <div
                      key={hIdx}
                      style={{
                        position: 'absolute',
                        top: hIdx * HOUR_HEIGHT,
                        left: 0,
                        right: 0,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        pointerEvents: 'none',
                      }}
                    />
                  ))}

                  {/* Course blocks */}
                  {dayOccs.map((occ, i) => {
                    const startH = timeToDecimalHours(occ.start_time)
                    const endH = timeToDecimalHours(occ.end_time)
                    if (startH >= END_HOUR || endH <= START_HOUR) return null

                    const clampedStart = Math.max(startH, START_HOUR)
                    const clampedEnd = Math.min(endH, END_HOUR)
                    const top = (clampedStart - START_HOUR) * HOUR_HEIGHT
                    const height = Math.max(22, (clampedEnd - clampedStart) * HOUR_HEIGHT)

                    return (
                      <div
                        key={`${occ.course_id}-${i}`}
                        onClick={() => router.push(`/courses/${occ.course_id}/calendar`)}
                        style={{
                          position: 'absolute',
                          top,
                          height,
                          left: 3,
                          right: 3,
                          zIndex: 2,
                          background: `${occ.course_color}CC`,
                          borderRadius: 8,
                          padding: '4px 8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          filter: isSelected ? 'brightness(1.1)' : undefined,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#0F131F',
                            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.3,
                          }}
                        >
                          {occ.course_name}
                        </p>
                        {height >= 36 && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: 10,
                              color: 'rgba(15,19,31,0.72)',
                              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                              whiteSpace: 'nowrap',
                              lineHeight: 1.2,
                            }}
                          >
                            {formatDisplayTime(occ.start_time)}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* Day Detail Panel */}
      <DayDetailPanel
        date={selectedDate}
        occs={selectedOccs}
        hw={selectedHw}
        exams={selectedExams}
        courseById={courseById}
        onClassClick={(courseId) => router.push(`/courses/${courseId}/calendar`)}
        onHwClick={(courseId) => router.push(`/courses/${courseId}/homework`)}
        onExamClick={(courseId) => router.push(`/courses/${courseId}/exams`)}
      />
    </div>
  )
}

// ─── Day Detail Panel ────────────────────────────────────────────────────────

type DayDetailPanelProps = {
  date: Date
  occs: CalendarOccurrence[]
  hw: HomeworkForPlanner[]
  exams: ExamForPlanner[]
  courseById: Map<string, CourseForPlanner>
  onClassClick: (courseId: string) => void
  onHwClick: (courseId: string) => void
  onExamClick: (courseId: string) => void
}

function DayDetailPanel({ date, occs, hw, exams, courseById, onClassClick, onHwClick, onExamClick }: DayDetailPanelProps) {
  const hasContent = occs.length > 0 || hw.length > 0 || exams.length > 0

  return (
    <div style={{ padding: '16px 20px 128px' }}>
      {/* Section label */}
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'rgba(223,226,243,0.40)',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
        }}
      >
        {formatDayLabel(date)}
      </p>

      {!hasContent ? (
        <div
          style={{
            textAlign: 'center',
            padding: '24px 0',
            fontSize: 14,
            color: 'rgba(223,226,243,0.28)',
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          }}
        >
          Nothing scheduled
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Classes */}
          {occs.map((occ, i) => (
            <EventRow
              key={`${occ.course_id}-${i}`}
              leftColor={occ.course_color}
              title={occ.course_name}
              detail={`${formatDisplayTime(occ.start_time)} – ${formatDisplayTime(occ.end_time)}${occ.room ? ` · ${occ.room}` : ''}`}
              onClick={() => onClassClick(occ.course_id)}
            />
          ))}
          {/* Exams */}
          {exams.map((exam) => (
            <EventRow
              key={exam.id}
              leftColor="#FF6B6B"
              title={exam.title}
              detail={courseById.get(exam.course_id)?.name ?? ''}
              onClick={() => onExamClick(exam.course_id)}
            />
          ))}
          {/* Homework */}
          {hw.map((h) => (
            <EventRow
              key={h.id}
              leftColor="#FFB955"
              title={h.title}
              detail={courseById.get(h.course_id)?.name ?? ''}
              onClick={() => onHwClick(h.course_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EventRow({
  leftColor,
  title,
  detail,
  onClick,
}: {
  leftColor: string
  title: string
  detail: string
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: 12,
        background: '#1B1F2C',
        overflow: 'hidden',
        cursor: 'pointer',
        minHeight: 52,
      }}
    >
      <div style={{ width: 4, flexShrink: 0, background: leftColor }} />
      <div
        style={{
          flex: 1,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 2,
          minWidth: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 500,
            color: '#DFE2F3',
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </p>
        {detail && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: 'rgba(223,226,243,0.50)',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {detail}
          </p>
        )}
      </div>
    </div>
  )
}

function HeaderBadge({
  title,
  background,
  color,
  border,
  onClick,
}: {
  title: string
  background: string
  color: string
  border: string
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '100%',
        background,
        color,
        border,
        borderRadius: 10,
        padding: '2px 8px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        fontFamily: 'var(--font-manrope), Manrope, sans-serif',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      {title}
    </div>
  )
}

const navBtnStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: 10,
  border: 'none',
  background: 'rgba(74,69,79,0.20)',
  color: '#DFE2F3',
  cursor: 'pointer',
  flexShrink: 0,
}
