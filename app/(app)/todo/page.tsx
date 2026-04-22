import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTodos, getCategories } from '@/lib/supabase/queries/todos'
import TodoClient from '@/components/todos/TodoClient'

export default async function TodoPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [todos, categories] = await Promise.all([
    getTodos(supabase, user.id),
    getCategories(supabase, user.id),
  ])

  return <TodoClient todos={todos} categories={categories} userId={user.id} />
}
