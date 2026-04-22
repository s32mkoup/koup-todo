import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type DBCourse = Database['public']['Tables']['courses']['Row']
type DBCourseSchedule = Database['public']['Tables']['course_schedules']['Row']

export type CourseWithSchedules = DBCourse & {
  course_schedules: DBCourseSchedule[]
}

export type ScheduleSlotInput = {
  day_of_week: number
  start_time: string
  end_time: string
}

export type CreateCourseInput = {
  user_id: string
  name: string
  code?: string | null
  professor?: string | null
  room?: string | null
  color?: string
  semester_start: string
  semester_end: string
  schedules: ScheduleSlotInput[]
}

export type UpdateCourseInput = {
  name?: string
  code?: string | null
  professor?: string | null
  room?: string | null
  color?: string
  semester_start?: string
  semester_end?: string
}

export async function getCourses(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DBCourse[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getCourse(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<CourseWithSchedules | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*, course_schedules(*)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as CourseWithSchedules
}

export async function createCourse(
  supabase: SupabaseClient<Database>,
  input: CreateCourseInput,
): Promise<DBCourse> {
  const { schedules, ...courseData } = input

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      user_id: courseData.user_id,
      name: courseData.name,
      code: courseData.code ?? null,
      professor: courseData.professor ?? null,
      room: courseData.room ?? null,
      color: courseData.color ?? '#7B5EA7',
      semester_start: courseData.semester_start,
      semester_end: courseData.semester_end,
    })
    .select()
    .single()

  if (courseError) throw courseError

  if (schedules.length > 0) {
    const { error: schedError } = await supabase
      .from('course_schedules')
      .insert(
        schedules.map((s) => ({
          course_id: course.id,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      )

    if (schedError) throw schedError
  }

  return course
}

export async function updateCourse(
  supabase: SupabaseClient<Database>,
  id: string,
  input: UpdateCourseInput,
): Promise<DBCourse> {
  const { data, error } = await supabase
    .from('courses')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCourse(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}
