/**
 * Calendar utility — Phase 4
 * Generates weekly course occurrences from semester schedule data.
 * day_of_week convention: 0 = Monday, 6 = Sunday (matches DB schema).
 */

export type CalendarOccurrence = {
  date: Date
  start_time: string  // "HH:MM:SS"
  end_time: string    // "HH:MM:SS"
  course_id: string
  course_name: string
  course_color: string
  room: string | null
}

type CourseInput = {
  id: string
  name: string
  color: string
  room: string | null
  semester_start: string  // "YYYY-MM-DD"
  semester_end: string    // "YYYY-MM-DD"
}

type ScheduleInput = {
  day_of_week: number     // 0=Mon … 6=Sun
  start_time: string | null
  end_time: string | null
}

/** Advance a "HH:MM:SS" string by one hour, capping at "23:59:00" */
function addOneHour(time: string): string {
  const parts = time.split(':')
  const h = parseInt(parts[0], 10)
  const m = parts[1] ?? '00'
  const s = parts[2] ?? '00'
  const newH = Math.min(h + 1, 23)
  return `${String(newH).padStart(2, '0')}:${m}:${s}`
}

/**
 * Generates one occurrence per schedule slot per week between
 * semester_start and semester_end (inclusive on both ends).
 */
export function generateCourseOccurrences(
  course: CourseInput,
  schedules: ScheduleInput[],
): CalendarOccurrence[] {
  const occurrences: CalendarOccurrence[] = []

  // Use local midnight to avoid DST crossing dates
  const semStart = localMidnight(course.semester_start)
  const semEnd   = localMidnight(course.semester_end)

  for (const slot of schedules) {
    // Our day_of_week (0=Mon) → JS Date.getDay() (0=Sun)
    const jsDay = (slot.day_of_week + 1) % 7

    // Resolve times: if end_time is missing, default to start_time + 1 hour so the
    // block is still visible in the time grid. If both are missing, fall back to
    // 00:00/01:00 (which the grid will filter out as outside the 8 AM–midnight range).
    const startTime = slot.start_time ?? '00:00:00'
    const endTime   = slot.end_time   ?? (slot.start_time ? addOneHour(slot.start_time) : '01:00:00')

    // Advance semStart to the first occurrence of jsDay on or after semStart
    const cursor = new Date(semStart)
    const diff = (jsDay - cursor.getDay() + 7) % 7
    cursor.setDate(cursor.getDate() + diff)

    while (cursor <= semEnd) {
      occurrences.push({
        date: new Date(cursor),
        start_time: startTime,
        end_time:   endTime,
        course_id:    course.id,
        course_name:  course.name,
        course_color: course.color,
        room:         course.room,
      })
      cursor.setDate(cursor.getDate() + 7)
    }
  }

  // Sort chronologically, then by start_time within the same day
  occurrences.sort((a, b) => {
    const dt = a.date.getTime() - b.date.getTime()
    return dt !== 0 ? dt : a.start_time.localeCompare(b.start_time)
  })

  return occurrences
}

// ─── Shared date helpers (also exported for CalendarClient) ────────────────

/** "YYYY-MM-DD" from a local Date — avoids timezone shifting */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Extract "YYYY-MM-DD" from an ISO timestamp string without timezone conversion */
export function isoToDateKey(iso: string): string {
  return iso.substring(0, 10)
}

/** Parse "HH:MM:SS" or "HH:MM" into decimal hours (e.g. "09:30" → 9.5) */
export function timeToDecimalHours(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h + m / 60
}

/** Format "HH:MM:SS" → "9:30 AM" */
export function formatDisplayTime(time: string): string {
  const [hStr, mStr] = time.split(':')
  const h = parseInt(hStr, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 || 12
  return `${display}:${mStr} ${ampm}`
}

/** Create a Date at local midnight for a "YYYY-MM-DD" string */
function localMidnight(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

/** Build the 6-week grid (42 cells) for a given year/month */
export function getMonthGrid(
  year: number,
  month: number,  // 0-indexed
): Array<{ date: Date; isCurrentMonth: boolean }> {
  const firstDay     = new Date(year, month, 1)
  const daysInMonth  = new Date(year, month + 1, 0).getDate()

  // Day of week of the 1st, adjusted to 0=Mon
  const firstDOW = (firstDay.getDay() + 6) % 7

  const grid: Array<{ date: Date; isCurrentMonth: boolean }> = []

  // Pad with previous-month days
  for (let i = firstDOW - 1; i >= 0; i--) {
    grid.push({ date: new Date(year, month, -i), isCurrentMonth: false })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }
  // Pad to 42 cells
  let next = 1
  while (grid.length < 42) {
    grid.push({ date: new Date(year, month + 1, next++), isCurrentMonth: false })
  }

  return grid
}

/** Return the 7 Date objects for Mon–Sun of the week containing refDate */
export function getWeekDays(refDate: Date): Date[] {
  const dow = (refDate.getDay() + 6) % 7  // 0=Mon
  const monday = new Date(refDate)
  monday.setDate(refDate.getDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

/** Short weekday names Mon-first */
export const WEEK_DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Full month names */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
