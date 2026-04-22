import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlannerClient from '@/components/planner/PlannerClient'
import type { CourseForPlanner, HomeworkForPlanner, ExamForPlanner } from '@/components/planner/PlannerClient'

export default async function PlannerPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { data: courseRows },
    { data: homeworkRows },
    { data: examRows },
  ] = await Promise.all([
    supabase
      .from('courses')
      .select('*, course_schedules(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('homework')
      .select('id, title, deadline, course_id')
      .eq('user_id', user.id)
      .eq('has_deadline', true)
      .eq('is_done', false)
      .not('deadline', 'is', null),
    supabase
      .from('exams')
      .select('id, title, exam_date, course_id')
      .eq('user_id', user.id),
  ])

  type RawCourse = {
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

  const courses: CourseForPlanner[] = ((courseRows ?? []) as unknown as RawCourse[]).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    room: c.room,
    semester_start: c.semester_start,
    semester_end: c.semester_end,
    course_schedules: c.course_schedules ?? [],
  }))

  const homework: HomeworkForPlanner[] = (homeworkRows ?? []).map((hw) => ({
    id: hw.id,
    title: hw.title,
    deadline: hw.deadline!,
    course_id: hw.course_id,
  }))

  const exams: ExamForPlanner[] = (examRows ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    exam_date: e.exam_date,
    course_id: e.course_id,
  }))

  return (
    <PlannerClient
      courses={courses}
      homework={homework}
      exams={exams}
    />
  )
}
