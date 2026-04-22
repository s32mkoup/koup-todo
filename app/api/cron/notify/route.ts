import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramMessage } from '@/lib/telegram'
import type { Database } from '@/lib/supabase/types'

type ProfileRelation = {
  telegram_chat_id: string | null
}

type CourseRelation = {
  name: string
}

type HomeworkReminder = Database['public']['Tables']['homework']['Row'] & {
  profiles: ProfileRelation | ProfileRelation[] | null
  courses: CourseRelation | CourseRelation[] | null
}

type TodoReminder = Database['public']['Tables']['todos']['Row'] & {
  profiles: ProfileRelation | ProfileRelation[] | null
}

function getRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null
  return relation
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function formatDate(value: string | null): string {
  if (!value) return 'No deadline set'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  const now = new Date()
  const windowEnd = new Date(now.getTime() + 5 * 60 * 1000)

  const { data: homework, error: homeworkError } = await supabase
    .from('homework')
    .select('*, profiles!inner(telegram_chat_id), courses!inner(name)')
    .gte('remind_at', now.toISOString())
    .lte('remind_at', windowEnd.toISOString())
    .eq('reminder_sent', false)
    .eq('is_done', false)

  if (homeworkError) throw homeworkError

  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('*, profiles!inner(telegram_chat_id)')
    .gte('remind_at', now.toISOString())
    .lte('remind_at', windowEnd.toISOString())
    .eq('reminder_sent', false)
    .eq('is_done', false)

  if (todosError) throw todosError

  let notifiedHomework = 0
  let notifiedTodos = 0

  for (const item of (homework ?? []) as HomeworkReminder[]) {
    const profile = getRelation(item.profiles)
    const course = getRelation(item.courses)
    const chatId = profile?.telegram_chat_id

    if (!chatId) continue

    await sendTelegramMessage(
      chatId,
      [
        '⏰ <b>Homework Reminder</b>',
        `📚 Course: ${escapeHtml(course?.name ?? 'Unknown course')}`,
        `📝 Task: ${escapeHtml(item.title)}`,
        `⏳ Deadline: ${escapeHtml(formatDate(item.deadline))}`,
      ].join('\n'),
    )

    const { error } = await supabase
      .from('homework')
      .update({ reminder_sent: true })
      .eq('id', item.id)

    if (error) throw error
    notifiedHomework += 1
  }

  for (const item of (todos ?? []) as TodoReminder[]) {
    const profile = getRelation(item.profiles)
    const chatId = profile?.telegram_chat_id

    if (!chatId) continue

    await sendTelegramMessage(
      chatId,
      [
        '✅ <b>Todo Reminder</b>',
        `📌 ${escapeHtml(item.title)}`,
        `🗓 Due: ${escapeHtml(formatDate(item.due_at))}`,
      ].join('\n'),
    )

    const { error } = await supabase
      .from('todos')
      .update({ reminder_sent: true })
      .eq('id', item.id)

    if (error) throw error
    notifiedTodos += 1
  }

  return NextResponse.json({
    notified_homework: notifiedHomework,
    notified_todos: notifiedTodos,
  })
}
