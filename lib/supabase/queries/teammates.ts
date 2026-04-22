import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type DBTeammate = Database['public']['Tables']['teammates']['Row']

export type { DBTeammate }

export type CreateTeammateInput = {
  course_id: string
  user_id: string
  name: string
  email?: string | null
}

export async function getTeammates(
  supabase: SupabaseClient<Database>,
  courseId: string,
): Promise<DBTeammate[]> {
  const { data, error } = await supabase
    .from('teammates')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createTeammate(
  supabase: SupabaseClient<Database>,
  input: CreateTeammateInput,
): Promise<DBTeammate> {
  const { data, error } = await supabase
    .from('teammates')
    .insert({
      course_id: input.course_id,
      user_id: input.user_id,
      name: input.name,
      email: input.email ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTeammate(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('teammates').delete().eq('id', id)
  if (error) throw error
}
