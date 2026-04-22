'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { createCourse, type ScheduleSlotInput } from '@/lib/supabase/queries/courses'

const COURSE_COLORS = [
  '#7B5EA7',
  '#00C9A7',
  '#FFB547',
  '#FF6B6B',
  '#4A9EFF',
  '#FF6BFF',
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

type ScheduleRow = ScheduleSlotInput & { key: number }

export default function AddCourseModal({ isOpen, onClose, onSuccess, userId }: Props) {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [professor, setProfessor] = useState('')
  const [room, setRoom] = useState('')
  const [color, setColor] = useState(COURSE_COLORS[0])
  const [semesterStart, setSemesterStart] = useState('')
  const [semesterEnd, setSemesterEnd] = useState('')
  const [schedules, setSchedules] = useState<ScheduleRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextKey, setNextKey] = useState(0)

  function resetForm() {
    setName('')
    setCode('')
    setProfessor('')
    setRoom('')
    setColor(COURSE_COLORS[0])
    setSemesterStart('')
    setSemesterEnd('')
    setSchedules([])
    setError(null)
    setNextKey(0)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function addScheduleRow() {
    setSchedules((prev) => [
      ...prev,
      { key: nextKey, day_of_week: 0, start_time: '09:00', end_time: '10:00' },
    ])
    setNextKey((k) => k + 1)
  }

  function removeScheduleRow(key: number) {
    setSchedules((prev) => prev.filter((s) => s.key !== key))
  }

  function updateScheduleRow(key: number, field: keyof ScheduleSlotInput, value: string | number) {
    setSchedules((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Course name is required.')
      return
    }
    if (!semesterStart || !semesterEnd) {
      setError('Semester start and end dates are required.')
      return
    }

    setLoading(true)
    try {
      await createCourse(supabase, {
        user_id: userId,
        name: name.trim(),
        code: code.trim() || null,
        professor: professor.trim() || null,
        room: room.trim() || null,
        color,
        semester_start: semesterStart,
        semester_end: semesterEnd,
        schedules: schedules.map(({ day_of_week, start_time, end_time }) => ({
          day_of_week,
          start_time: `${start_time}:00`,
          end_time: `${end_time}:00`,
        })),
      })
      resetForm()
      onSuccess()
    } catch {
      setError('Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Course">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-4">
        {/* Course name */}
        <Input
          label="Course Name *"
          placeholder="e.g. Machine Learning"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
        />

        {/* Code + Professor */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Code"
            placeholder="e.g. CS401"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
          />
          <Input
            label="Professor"
            placeholder="e.g. Dr. Müller"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Room */}
        <Input
          label="Room"
          placeholder="e.g. HS 1, Informatikzentrum"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          autoComplete="off"
        />

        {/* Color picker */}
        <div className="flex flex-col gap-2">
          <span
            className="text-xs font-medium tracking-[0.03em]"
            style={{ color: 'rgba(223,226,243,0.60)', fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
          >
            COURSE COLOR
          </span>
          <div className="flex gap-3">
            {COURSE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="relative h-8 w-8 rounded-full transition-transform duration-150 active:scale-90"
                style={{ background: c }}
                aria-label={`Select color ${c}`}
              >
                {color === c && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: `0 0 0 2px #0F131F, 0 0 0 4px ${c}`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Semester dates */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Semester Start *"
            type="date"
            value={semesterStart}
            onChange={(e) => setSemesterStart(e.target.value)}
            style={{ colorScheme: 'dark' }}
          />
          <Input
            label="Semester End *"
            type="date"
            value={semesterEnd}
            onChange={(e) => setSemesterEnd(e.target.value)}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Weekly schedule */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-medium tracking-[0.03em]"
              style={{ color: 'rgba(223,226,243,0.60)', fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
            >
              WEEKLY SCHEDULE
            </span>
            <button
              type="button"
              onClick={addScheduleRow}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150"
              style={{
                color: '#D6BAFF',
                background: 'rgba(123,94,167,0.15)',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              }}
            >
              <Plus size={13} strokeWidth={2} />
              Add slot
            </button>
          </div>

          {schedules.length === 0 && (
            <p
              className="text-center text-sm py-3"
              style={{ color: 'rgba(223,226,243,0.30)', fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
            >
              No schedule yet — tap Add slot
            </p>
          )}

          {schedules.map((row) => (
            <div
              key={row.key}
              className="flex items-center gap-2 rounded-xl p-3"
              style={{ background: '#0A0E1A' }}
            >
              {/* Day select */}
              <select
                value={row.day_of_week}
                onChange={(e) => updateScheduleRow(row.key, 'day_of_week', Number(e.target.value))}
                className="flex-1 rounded-lg border px-2 py-2 text-sm outline-none"
                style={{
                  background: '#171B28',
                  borderColor: 'rgba(74,69,79,0.40)',
                  color: '#DFE2F3',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                }}
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Start time */}
              <input
                type="time"
                value={row.start_time}
                onChange={(e) => updateScheduleRow(row.key, 'start_time', e.target.value)}
                className="w-24 rounded-lg border px-2 py-2 text-sm outline-none"
                style={{
                  background: '#171B28',
                  borderColor: 'rgba(74,69,79,0.40)',
                  color: '#DFE2F3',
                  colorScheme: 'dark',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                }}
              />

              <span className="text-xs" style={{ color: 'rgba(223,226,243,0.40)' }}>
                –
              </span>

              {/* End time */}
              <input
                type="time"
                value={row.end_time}
                onChange={(e) => updateScheduleRow(row.key, 'end_time', e.target.value)}
                className="w-24 rounded-lg border px-2 py-2 text-sm outline-none"
                style={{
                  background: '#171B28',
                  borderColor: 'rgba(74,69,79,0.40)',
                  color: '#DFE2F3',
                  colorScheme: 'dark',
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                }}
              />

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeScheduleRow(row.key)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150"
                style={{ color: '#FF6B6B', background: 'rgba(255,107,107,0.10)' }}
                aria-label="Remove schedule slot"
              >
                <Trash2 size={14} strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(255,107,107,0.10)',
              color: '#FF6B6B',
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
          Create Course
        </Button>
      </form>
    </Modal>
  )
}
