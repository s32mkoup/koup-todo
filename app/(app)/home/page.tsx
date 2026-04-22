import { redirect } from 'next/navigation'
import HomeClient, {
  type HomeClass,
  type HomeExam,
  type HomeHomework,
  type HomeTodo,
} from '@/components/home/HomeClient'
import { createClient } from '@/lib/supabase/server'
import { generateCourseOccurrences, toDateKey } from '@/lib/utils/calendar'

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

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function endOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const now = new Date()
  const todayStart = startOfLocalDay(now)
  const todayEnd = endOfLocalDay(now)
  const nextWeekEnd = endOfLocalDay(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))
  const todayKey = toDateKey(now)

  const [
    { data: profile },
    { data: courseRows, error: coursesError },
    { data: homeworkRows, error: homeworkError },
    { data: examRows, error: examsError },
    { data: todoRows, error: todosError },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('courses')
      .select('*, course_schedules(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('homework')
      .select('id, title, deadline, course_id')
      .eq('user_id', user.id)
      .eq('is_done', false)
      .eq('has_deadline', true)
      .gte('deadline', todayStart.toISOString())
      .lte('deadline', todayEnd.toISOString())
      .order('deadline', { ascending: true }),
    supabase
      .from('exams')
      .select('id, title, exam_date, course_id')
      .eq('user_id', user.id)
      .gte('exam_date', now.toISOString())
      .lte('exam_date', nextWeekEnd.toISOString())
      .order('exam_date', { ascending: true }),
    supabase
      .from('todos')
      .select('id, title, due_at, priority')
      .eq('user_id', user.id)
      .eq('is_done', false)
      .not('due_at', 'is', null)
      .lte('due_at', todayEnd.toISOString())
      .order('due_at', { ascending: true }),
  ])

  if (coursesError) throw coursesError
  if (homeworkError) throw homeworkError
  if (examsError) throw examsError
  if (todosError) throw todosError

  const courses = ((courseRows ?? []) as unknown as RawCourse[]).map((course) => ({
    ...course,
    course_schedules: course.course_schedules ?? [],
  }))
  const courseById = new Map(courses.map((course) => [course.id, course]))

  const todaysClasses: HomeClass[] = courses
    .flatMap((course) => generateCourseOccurrences(course, course.course_schedules))
    .filter((occurrence) => toDateKey(occurrence.date) === todayKey)
    .map((occurrence) => ({
      id: `${occurrence.course_id}-${occurrence.start_time}`,
      courseId: occurrence.course_id,
      courseName: occurrence.course_name,
      courseColor: occurrence.course_color,
      startTime: occurrence.start_time,
      endTime: occurrence.end_time,
      room: occurrence.room,
    }))

  const homeworkDueToday: HomeHomework[] = (homeworkRows ?? []).map((homework) => {
    const course = courseById.get(homework.course_id)
    return {
      id: homework.id,
      title: homework.title,
      deadline: homework.deadline!,
      courseName: course?.name ?? 'Course',
    }
  })

  const upcomingExams: HomeExam[] = (examRows ?? []).map((exam) => {
    const course = courseById.get(exam.course_id)
    return {
      id: exam.id,
      title: exam.title,
      examDate: exam.exam_date,
      courseName: course?.name ?? 'Course',
    }
  })

  const urgentTodos: HomeTodo[] = (todoRows ?? []).map((todo) => ({
    id: todo.id,
    title: todo.title,
    dueAt: todo.due_at!,
    priority: todo.priority,
  }))

  const displayName =
    profile?.name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Erfan'

  return (
    <HomeClient
      name={displayName}
      initialNowIso={now.toISOString()}
      todaysClasses={todaysClasses}
      homeworkDueToday={homeworkDueToday}
      upcomingExams={upcomingExams}
      urgentTodos={urgentTodos}
    />
  )
}
