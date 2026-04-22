import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

type DBTodo = Database['public']['Tables']['todos']['Row']
type DBTodoCategory = Database['public']['Tables']['todo_categories']['Row']

export type { DBTodo, DBTodoCategory }

export type CreateTodoInput = {
  user_id: string
  title: string
  description?: string | null
  category_id?: string | null
  priority?: string
  due_at?: string | null
  remind_at?: string | null
}

export type UpdateTodoInput = {
  title?: string
  description?: string | null
  category_id?: string | null
  priority?: string
  due_at?: string | null
  remind_at?: string | null
}

export type CreateCategoryInput = {
  user_id: string
  name: string
  color?: string
}

export async function getTodos(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DBTodo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('due_at', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

export async function createTodo(
  supabase: SupabaseClient<Database>,
  input: CreateTodoInput,
): Promise<DBTodo> {
  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: input.user_id,
      title: input.title,
      description: input.description ?? null,
      category_id: input.category_id ?? null,
      priority: input.priority ?? 'medium',
      due_at: input.due_at ?? null,
      remind_at: input.remind_at ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTodo(
  supabase: SupabaseClient<Database>,
  id: string,
  input: UpdateTodoInput,
): Promise<DBTodo> {
  const { data, error } = await supabase
    .from('todos')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTodo(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', id)
  if (error) throw error
}

export async function toggleTodoDone(
  supabase: SupabaseClient<Database>,
  id: string,
  isDone: boolean,
): Promise<DBTodo> {
  const { data, error } = await supabase
    .from('todos')
    .update({ is_done: isDone })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCategories(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DBTodoCategory[]> {
  const { data, error } = await supabase
    .from('todo_categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createCategory(
  supabase: SupabaseClient<Database>,
  input: CreateCategoryInput,
): Promise<DBTodoCategory> {
  const { data, error } = await supabase
    .from('todo_categories')
    .insert({
      user_id: input.user_id,
      name: input.name,
      color: input.color ?? '#7B5EA7',
    })
    .select()
    .single()

  if (error) throw error
  return data
}
