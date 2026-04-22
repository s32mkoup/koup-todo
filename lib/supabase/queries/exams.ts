import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type DBExam = Database['public']['Tables']['exams']['Row']

export type { DBExam }

export type CreateExamInput = {
  course_id: string
  user_id: string
  title: string
  exam_date: string
  location?: string | null
  topics?: string | null
  readiness?: number | null
}

export type UpdateExamInput = {
  title?: string
  exam_date?: string
  location?: string | null
  topics?: string | null
  readiness?: number | null
}

export async function getExams(
  supabase: SupabaseClient<Database>,
  courseId: string,
): Promise<DBExam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('course_id', courseId)
    .order('exam_date', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createExam(
  supabase: SupabaseClient<Database>,
  input: CreateExamInput,
): Promise<DBExam> {
  const { data, error } = await supabase
    .from('exams')
    .insert({
      course_id: input.course_id,
      user_id: input.user_id,
      title: input.title,
      exam_date: input.exam_date,
      location: input.location ?? null,
      topics: input.topics ?? null,
      readiness: input.readiness ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExam(
  supabase: SupabaseClient<Database>,
  id: string,
  input: UpdateExamInput,
): Promise<DBExam> {
  const { data, error } = await supabase
    .from('exams')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExam(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('exams').delete().eq('id', id)
  if (error) throw error
}

export async function updateReadiness(
  supabase: SupabaseClient<Database>,
  id: string,
  readiness: number,
): Promise<DBExam> {
  const { data, error } = await supabase
    .from('exams')
    .update({ readiness })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
