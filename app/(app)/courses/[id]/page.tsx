import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/supabase/queries/courses'
import CourseHubClient from '@/components/courses/CourseHubClient'

type Props = {
  params: { id: string }
}

export default async function CourseHubPage({ params }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const course = await getCourse(supabase, params.id)
  if (!course) notFound()

  // Fetch pending homework count and total exam count in parallel
  const [{ count: homeworkCount }, { count: examCount }] = await Promise.all([
    supabase
      .from('homework')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', params.id)
      .eq('is_done', false),
    supabase
      .from('exams')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', params.id),
  ])

  return (
    <CourseHubClient
      course={course}
      homeworkCount={homeworkCount ?? 0}
      examCount={examCount ?? 0}
    />
  )
}
