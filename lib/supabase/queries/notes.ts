import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type DBNote = Database['public']['Tables']['notes']['Row']

export type { DBNote }

export type CreateNoteInput = {
  course_id: string
  user_id: string
  content?: string | null
  url?: string | null
}

export async function getNotes(
  supabase: SupabaseClient<Database>,
  courseId: string,
): Promise<DBNote[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createNote(
  supabase: SupabaseClient<Database>,
  input: CreateNoteInput,
): Promise<DBNote> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      course_id: input.course_id,
      user_id: input.user_id,
      content: input.content ?? null,
      url: input.url ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNote(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}
