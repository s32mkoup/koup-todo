import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type DBHomework = Database['public']['Tables']['homework']['Row']

export type { DBHomework }

export type CreateHomeworkInput = {
  course_id: string
  user_id: string
  title: string
  description?: string | null
  has_deadline?: boolean
  deadline?: string | null
  remind_at?: string | null
}

export type UpdateHomeworkInput = {
  title?: string
  description?: string | null
  has_deadline?: boolean
  deadline?: string | null
  remind_at?: string | null
}

export async function getHomework(
  supabase: SupabaseClient<Database>,
  courseId: string,
): Promise<DBHomework[]> {
  const { data, error } = await supabase
    .from('homework')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createHomework(
  supabase: SupabaseClient<Database>,
  input: CreateHomeworkInput,
): Promise<DBHomework> {
  const { data, error } = await supabase
    .from('homework')
    .insert({
      course_id: input.course_id,
      user_id: input.user_id,
      title: input.title,
      description: input.description ?? null,
      has_deadline: input.has_deadline ?? false,
      deadline: input.deadline ?? null,
      remind_at: input.remind_at ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateHomework(
  supabase: SupabaseClient<Database>,
  id: string,
  input: UpdateHomeworkInput,
): Promise<DBHomework> {
  const { data, error } = await supabase
    .from('homework')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteHomework(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('homework').delete().eq('id', id)
  if (error) throw error
}

export async function toggleHomeworkDone(
  supabase: SupabaseClient<Database>,
  id: string,
  isDone: boolean,
): Promise<DBHomework> {
  const { data, error } = await supabase
    .from('homework')
    .update({ is_done: isDone })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
