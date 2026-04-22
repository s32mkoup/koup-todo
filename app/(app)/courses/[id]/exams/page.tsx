import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/supabase/queries/courses'
import { getExams } from '@/lib/supabase/queries/exams'
import CourseTabBar from '@/components/courses/CourseTabBar'
import ExamsClient from '@/components/exams/ExamsClient'

type Props = {
  params: { id: string }
}

export default async function ExamsPage({ params }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const course = await getCourse(supabase, params.id)
  if (!course) notFound()

  const exams = await getExams(supabase, params.id)

  return (
    <>
      <CourseTabBar courseId={course.id} courseColor={course.color} />
      <ExamsClient
        course={{
          id: course.id,
          name: course.name,
          color: course.color,
        }}
        exams={exams}
      />
    </>
  )
}
