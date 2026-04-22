import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/supabase/queries/courses'
import CourseTabBar from '@/components/courses/CourseTabBar'
import CalendarClient from '@/components/courses/CalendarClient'

type Props = {
  params: { id: string }
}

export default async function CourseCalendarPage({ params }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const course = await getCourse(supabase, params.id)
  if (!course) notFound()

  const [{ data: homeworkRows }, { data: examRows }] = await Promise.all([
    supabase
      .from('homework')
      .select('id, title, deadline, is_done')
      .eq('course_id', params.id)
      .eq('has_deadline', true)
      .not('deadline', 'is', null)
      .order('deadline', { ascending: true }),
    supabase
      .from('exams')
      .select('id, title, exam_date, location')
      .eq('course_id', params.id)
      .order('exam_date', { ascending: true }),
  ])

  return (
    <>
      <CourseTabBar courseId={course.id} courseColor={course.color} />
      <CalendarClient
        course={{
          id: course.id,
          name: course.name,
          color: course.color,
          room: course.room,
          semester_start: course.semester_start,
          semester_end: course.semester_end,
          course_schedules: course.course_schedules.map((s) => ({
            id: s.id,
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
          })),
        }}
        homework={(homeworkRows ?? []).map((hw) => ({
          id: hw.id,
          title: hw.title,
          deadline: hw.deadline!,
          is_done: hw.is_done,
        }))}
        exams={(examRows ?? []).map((e) => ({
          id: e.id,
          title: e.title,
          exam_date: e.exam_date,
          location: e.location,
        }))}
      />
    </>
  )
}
