import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type DBGrade = Database['public']['Tables']['grades']['Row']

export type { DBGrade }

export type CreateGradeInput = {
  course_id: string
  user_id: string
  item_name: string
  max_score: number
  received_score: number
}

export async function getGrades(
  supabase: SupabaseClient<Database>,
  courseId: string,
): Promise<DBGrade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createGrade(
  supabase: SupabaseClient<Database>,
  input: CreateGradeInput,
): Promise<DBGrade> {
  const { data, error } = await supabase
    .from('grades')
    .insert({
      course_id: input.course_id,
      user_id: input.user_id,
      item_name: input.item_name,
      max_score: input.max_score,
      received_score: input.received_score,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGrade(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('grades').delete().eq('id', id)
  if (error) throw error
}
