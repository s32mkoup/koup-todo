import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type DBHomework = Database['public']['Tables']['homework']['Row']

export async function setHomeworkReminder(
  supabase: SupabaseClient<Database>,
  id: string,
  remindAt: string | null,
): Promise<DBHomework> {
  const { data, error } = await supabase
    .from('homework')
    .update({
      remind_at: remindAt,
      reminder_sent: false,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
