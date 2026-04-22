'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import {
  generateCourseOccurrences,
  toDateKey,
  isoToDateKey,
  formatDisplayTime,
  timeToDecimalHours,
  getMonthGrid,
  getWeekDays,
  WEEK_DAYS_SHORT,
  MONTH_NAMES,
  type CalendarOccurrence,
} from '@/lib/utils/calendar'

// ─── Prop types ─────────────────────────────────────────────────────────────

type CourseSchedule = {
  id: string
  day_of_week: number
  start_time: string | null
  end_time: string | null
}

type CourseData = {
  id: string
  name: string
  color: string
  room: string | null
  semester_start: string
  semester_end: string
  course_schedules: CourseSchedule[]
}

type HomeworkEvent = {
  id: string
  title: string
  deadline: string   // ISO timestamp
  is_done: boolean
}

type ExamEvent = {
  id: string
  title: string
  exam_date: string  // ISO timestamp
  location: string | null
}

type DayEvents = {
  classes: CalendarOccurrence[]
  homework: HomeworkEvent[]
  exams: ExamEvent[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const START_HOUR  = 8    // 8 AM
const END_HOUR    = 22   // 10 PM
const HOUR_HEIGHT = 52   // px

// ─── Helpers ────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

function formatHourLabel(h: number): string {
  if (h === 0 || h === 12) return `${h === 0 ? 12 : 12} AM`
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

// ─── Main component ──────────────────────────────────────────────────────────

type Props = {
  course: CourseData
  homework: HomeworkEvent[]
  exams: ExamEvent[]
}

export default function CalendarClient({ course, homework, exams }: Props) {
  const today = useMemo(() => new Date(), [])
  const [view, setView]               = useState<'monthly' | 'weekly'>('monthly')
  const [currentDate, setCurrentDate] = useState<Date>(new Date(today))
  const [selectedDay, setSelectedDay] = useState<Date>(new Date(today))

  // Generate all class occurrences once
  const occurrences = useMemo(
    () => generateCourseOccurrences(course, course.course_schedules),
    [course],
  )

  // Build a date-keyed map of events for O(1) lookup
  const eventsByDate = useMemo<Map<string, DayEvents>>(() => {
    const map = new Map<string, DayEvents>()

    const ensure = (key: string): DayEvents => {
      if (!map.has(key)) map.set(key, { classes: [], homework: [], exams: [] })
      return map.get(key)!
    }

    for (const occ of occurrences) {
      ensure(toDateKey(occ.date)).classes.push(occ)
    }
    for (const hw of homework) {
      if (!hw.is_done) {
        ensure(isoToDateKey(hw.deadline)).homework.push(hw)
      }
    }
    for (const exam of exams) {
      ensure(isoToDateKey(exam.exam_date)).exams.push(exam)
    }

    return map
  }, [occurrences, homework, exams])

  const selectedKey    = toDateKey(selectedDay)
  const selectedEvents = eventsByDate.get(selectedKey) ?? { classes: [], homework: [], exams: [] }

  // Navigation
  function prevPeriod() {
    const d = new Date(currentDate)
    if (view === 'monthly') {
      d.setMonth(d.getMonth() - 1)
    } else {
      d.setDate(d.getDate() - 7)
    }
    setCurrentDate(d)
  }

  function nextPeriod() {
    const d = new Date(currentDate)
    if (view === 'monthly') {
      d.setMonth(d.getMonth() + 1)
    } else {
      d.setDate(d.getDate() + 7)
    }
    setCurrentDate(d)
  }

  function handleDaySelect(date: Date) {
    setSelectedDay(date)
    // Sync currentDate month/week when selecting from another period
    if (view === 'monthly') {
      if (date.getMonth() !== currentDate.getMonth() || date.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(new Date(date))
      }
    }
  }

  // Period label
  const periodLabel =
    view === 'monthly'
      ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      : (() => {
          const week = getWeekDays(currentDate)
          const first = week[0]
          const last  = week[6]
          if (first.getMonth() === last.getMonth()) {
            return `${MONTH_NAMES[first.getMonth()]} ${first.getDate()}–${last.getDate()}`
          }
          return `${MONTH_NAMES[first.getMonth()]} ${first.getDate()} – ${MONTH_NAMES[last.getMonth()]} ${last.getDate()}`
        })()

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#0F131F' }}>
      <PageHeader
        title="Calendar"
        subtitle={course.name}
        backHref={`/courses/${course.id}`}
      />

      {/* View toggle */}
      <div className="flex px-5 pb-3 pt-1 gap-2">
        {(['monthly', 'weekly'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-150"
            style={{
              background: view === v ? `${course.color}22` : 'transparent',
              color: view === v ? course.color : 'rgba(223,226,243,0.45)',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              fontWeight: view === v ? 600 : 400,
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between px-5 pb-4">
        <button
          onClick={prevPeriod}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-150 active:scale-95"
          style={{ background: '#1B1F2C', color: 'rgba(223,226,243,0.60)' }}
          aria-label="Previous"
        >
          <ChevronLeft size={18} strokeWidth={1.8} />
        </button>

        <button
          onClick={() => { setCurrentDate(new Date(today)); setSelectedDay(new Date(today)) }}
          className="text-sm font-semibold"
          style={{
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
            color: '#DFE2F3',
            letterSpacing: '-0.01em',
          }}
        >
          {periodLabel}
        </button>

        <button
          onClick={nextPeriod}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-150 active:scale-95"
          style={{ background: '#1B1F2C', color: 'rgba(223,226,243,0.60)' }}
          aria-label="Next"
        >
          <ChevronRight size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="px-4">
        {view === 'monthly' ? (
          <MonthlyGrid
            year={currentDate.getFullYear()}
            month={currentDate.getMonth()}
            today={today}
            selectedDay={selectedDay}
            eventsByDate={eventsByDate}
            courseColor={course.color}
            onSelectDay={handleDaySelect}
          />
        ) : (
          <WeeklyGrid
            refDate={currentDate}
            today={today}
            selectedDay={selectedDay}
            eventsByDate={eventsByDate}
            courseColor={course.color}
            onSelectDay={handleDaySelect}
          />
        )}
      </div>

      {/* Day event list */}
      <div className="mt-4 flex-1 px-4 pb-32">
        <DayEventList
          date={selectedDay}
          events={selectedEvents}
          courseColor={course.color}
        />
      </div>
    </div>
  )
}

// ─── Monthly grid ────────────────────────────────────────────────────────────

type MonthlyGridProps = {
  year: number
  month: number
  today: Date
  selectedDay: Date
  eventsByDate: Map<string, DayEvents>
  courseColor: string
  onSelectDay: (d: Date) => void
}

function MonthlyGrid({
  year, month, today, selectedDay, eventsByDate, courseColor, onSelectDay,
}: MonthlyGridProps) {
  const grid = useMemo(() => getMonthGrid(year, month), [year, month])

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#1B1F2C' }}>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 pt-3 pb-2">
        {WEEK_DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold tracking-[0.06em]"
            style={{
              color: 'rgba(223,226,243,0.35)',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            }}
          >
            {d.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5 px-1 pb-2">
        {grid.map(({ date, isCurrentMonth }, idx) => {
          const key       = toDateKey(date)
          const isToday   = isSameDay(date, today)
          const isSelected = isSameDay(date, selectedDay)
          const events    = eventsByDate.get(key)
          const hasClass  = (events?.classes.length  ?? 0) > 0
          const hasHW     = (events?.homework.length ?? 0) > 0
          const hasExam   = (events?.exams.length    ?? 0) > 0

          return (
            <button
              key={idx}
              onClick={() => onSelectDay(date)}
              className="flex flex-col items-center gap-0.5 py-1 rounded-xl transition-colors duration-120"
              style={{
                background: isSelected && !isToday ? 'rgba(214,186,255,0.10)' : 'transparent',
              }}
            >
              {/* Day number */}
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium"
                style={{
                  background: isToday ? '#7B5EA7' : 'transparent',
                  color: isToday
                    ? '#DFE2F3'
                    : isSelected
                    ? courseColor
                    : isCurrentMonth
                    ? '#DFE2F3'
                    : 'rgba(223,226,243,0.22)',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontWeight: isToday || isSelected ? 700 : 400,
                }}
              >
                {date.getDate()}
              </div>

              {/* Event dots */}
              <div className="flex items-center gap-0.5 h-1.5">
                {hasClass && (
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: isCurrentMonth ? courseColor : `${courseColor}55` }}
                  />
                )}
                {hasExam && (
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: isCurrentMonth ? '#FF6B6B' : '#FF6B6B55' }}
                  />
                )}
                {hasHW && (
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: isCurrentMonth ? '#FFB955' : '#FFB95555' }}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Weekly grid ─────────────────────────────────────────────────────────────

type WeeklyGridProps = {
  refDate: Date
  today: Date
  selectedDay: Date
  eventsByDate: Map<string, DayEvents>
  courseColor: string
  onSelectDay: (d: Date) => void
}

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const TOTAL_HEIGHT = HOURS.length * HOUR_HEIGHT

function WeeklyGrid({
  refDate, today, selectedDay, eventsByDate, courseColor, onSelectDay,
}: WeeklyGridProps) {
  const weekDays = useMemo(() => getWeekDays(refDate), [refDate])

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#1B1F2C' }}>
      {/* Day headers */}
      <div className="flex pl-8 pr-1 pt-3 pb-2">
        {weekDays.map((day, i) => {
          const isToday    = isSameDay(day, today)
          const isSelected = isSameDay(day, selectedDay)
          return (
            <button
              key={i}
              onClick={() => onSelectDay(day)}
              className="flex flex-1 flex-col items-center gap-0.5"
            >
              <span
                className="text-[10px] font-semibold tracking-[0.06em]"
                style={{
                  color: 'rgba(223,226,243,0.35)',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                }}
              >
                {WEEK_DAYS_SHORT[i].toUpperCase()}
              </span>
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium"
                style={{
                  background: isToday ? '#7B5EA7' : 'transparent',
                  color: isToday ? '#DFE2F3' : isSelected ? courseColor : '#DFE2F3',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontWeight: isToday || isSelected ? 700 : 400,
                }}
              >
                {day.getDate()}
              </div>
            </button>
          )
        })}
      </div>

      {/* Time grid */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: '480px' }}
      >
        <div className="flex" style={{ height: TOTAL_HEIGHT }}>
          {/* Time labels */}
          <div className="flex shrink-0 flex-col" style={{ width: 32 }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex shrink-0 items-start justify-end pr-1.5"
                style={{ height: HOUR_HEIGHT }}
              >
                <span
                  className="mt-[-6px] text-[9px]"
                  style={{
                    color: 'rgba(223,226,243,0.30)',
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatHourLabel(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, i) => {
            const key    = toDateKey(day)
            const events = eventsByDate.get(key) ?? { classes: [], homework: [], exams: [] }

            return (
              <div
                key={i}
                className="relative flex-1"
                style={{ borderLeft: '1px solid rgba(74,69,79,0.12)' }}
              >
                {/* Hour gridlines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{
                      position: 'absolute',
                      top: (h - START_HOUR) * HOUR_HEIGHT,
                      left: 0,
                      right: 0,
                      height: 1,
                      background: 'rgba(74,69,79,0.10)',
                    }}
                  />
                ))}

                {/* Class blocks */}
                {events.classes.map((occ, j) => {
                  const startDec = timeToDecimalHours(occ.start_time)
                  const endDec   = timeToDecimalHours(occ.end_time)
                  const top    = Math.max(0, (startDec - START_HOUR) * HOUR_HEIGHT)
                  const height = Math.max(18, (endDec - startDec) * HOUR_HEIGHT)

                  return (
                    <div
                      key={j}
                      className="absolute left-0.5 right-0.5 overflow-hidden rounded-md"
                      style={{
                        top,
                        height,
                        background: `${courseColor}30`,
                        borderLeft: `2px solid ${courseColor}`,
                      }}
                    >
                      <span
                        className="block px-1 pt-0.5 text-[9px] font-semibold leading-tight"
                        style={{
                          color: courseColor,
                          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                        }}
                      >
                        {formatDisplayTime(occ.start_time)}
                      </span>
                    </div>
                  )
                })}

                {/* Exam badges — placed at their exam time (top of day for now) */}
                {events.exams.map((exam, j) => (
                  <div
                    key={`exam-${j}`}
                    className="absolute left-0.5 right-0.5 rounded-md px-1 py-0.5"
                    style={{
                      top: 2 + j * 20,
                      background: 'rgba(255,107,107,0.20)',
                      borderLeft: '2px solid #FF6B6B',
                    }}
                  >
                    <span
                      className="block truncate text-[9px] font-semibold"
                      style={{
                        color: '#FF6B6B',
                        fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      }}
                    >
                      {exam.title}
                    </span>
                  </div>
                ))}

                {/* HW badges */}
                {events.homework.map((hw, j) => (
                  <div
                    key={`hw-${j}`}
                    className="absolute left-0.5 right-0.5 rounded-md px-1 py-0.5"
                    style={{
                      bottom: 4 + j * 20,
                      background: 'rgba(255,185,85,0.18)',
                      borderLeft: '2px solid #FFB955',
                    }}
                  >
                    <span
                      className="block truncate text-[9px] font-semibold"
                      style={{
                        color: '#FFB955',
                        fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      }}
                    >
                      {hw.title}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Day event list ───────────────────────────────────────────────────────────

type DayEventListProps = {
  date: Date
  events: DayEvents
  courseColor: string
}

function DayEventList({ date, events, courseColor }: DayEventListProps) {
  const hasAny =
    events.classes.length > 0 ||
    events.homework.length > 0 ||
    events.exams.length > 0

  const dayLabel = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex flex-col gap-3">
      {/* Date heading */}
      <p
        className="text-sm font-semibold"
        style={{
          color: 'rgba(223,226,243,0.50)',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          letterSpacing: '0.03em',
        }}
      >
        {dayLabel.toUpperCase()}
      </p>

      {!hasAny && (
        <div
          className="rounded-2xl px-5 py-6 text-center"
          style={{ background: '#1B1F2C' }}
        >
          <p
            className="text-sm"
            style={{
              color: 'rgba(223,226,243,0.30)',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            }}
          >
            Nothing scheduled
          </p>
        </div>
      )}

      {/* Class occurrences */}
      {events.classes.map((occ, i) => (
        <div
          key={i}
          className="flex items-stretch overflow-hidden rounded-2xl"
          style={{ background: '#1B1F2C' }}
        >
          <div className="w-1 shrink-0 self-stretch" style={{ background: courseColor }} />
          <div className="flex flex-1 flex-col gap-0.5 px-4 py-3">
            <p
              className="text-[15px] font-semibold"
              style={{
                color: '#DFE2F3',
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
              }}
            >
              {occ.course_name}
            </p>
            <p
              className="text-sm"
              style={{
                color: 'rgba(223,226,243,0.60)',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              }}
            >
              {formatDisplayTime(occ.start_time)} – {formatDisplayTime(occ.end_time)}
              {occ.room ? ` · ${occ.room}` : ''}
            </p>
          </div>
          <div className="flex items-center pr-4">
            <span
              className="rounded-lg px-2 py-1 text-[10px] font-semibold tracking-[0.04em]"
              style={{
                background: `${courseColor}22`,
                color: courseColor,
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              }}
            >
              CLASS
            </span>
          </div>
        </div>
      ))}

      {/* Exams */}
      {events.exams.map((exam, i) => (
        <div
          key={i}
          className="flex items-stretch overflow-hidden rounded-2xl"
          style={{ background: '#1B1F2C' }}
        >
          <div className="w-1 shrink-0 self-stretch" style={{ background: '#FF6B6B' }} />
          <div className="flex flex-1 flex-col gap-0.5 px-4 py-3">
            <p
              className="text-[15px] font-semibold"
              style={{
                color: '#DFE2F3',
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
              }}
            >
              {exam.title}
            </p>
            {exam.location && (
              <p
                className="text-sm"
                style={{
                  color: 'rgba(223,226,243,0.60)',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                }}
              >
                {exam.location}
              </p>
            )}
          </div>
          <div className="flex items-center pr-4">
            <span
              className="rounded-lg px-2 py-1 text-[10px] font-semibold tracking-[0.04em]"
              style={{
                background: 'rgba(255,107,107,0.15)',
                color: '#FF6B6B',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              }}
            >
              EXAM
            </span>
          </div>
        </div>
      ))}

      {/* Homework deadlines */}
      {events.homework.map((hw, i) => (
        <div
          key={i}
          className="flex items-stretch overflow-hidden rounded-2xl"
          style={{ background: '#1B1F2C' }}
        >
          <div className="w-1 shrink-0 self-stretch" style={{ background: '#FFB955' }} />
          <div className="flex flex-1 flex-col gap-0.5 px-4 py-3">
            <p
              className="text-[15px] font-semibold"
              style={{
                color: '#DFE2F3',
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
              }}
            >
              {hw.title}
            </p>
            <p
              className="text-sm"
              style={{
                color: 'rgba(223,226,243,0.60)',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              }}
            >
              Deadline
            </p>
          </div>
          <div className="flex items-center pr-4">
            <span
              className="rounded-lg px-2 py-1 text-[10px] font-semibold tracking-[0.04em]"
              style={{
                background: 'rgba(255,185,85,0.15)',
                color: '#FFB955',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              }}
            >
              DUE
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
