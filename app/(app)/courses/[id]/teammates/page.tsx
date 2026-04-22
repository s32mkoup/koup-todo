import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/supabase/queries/courses'
import { getTeammates } from '@/lib/supabase/queries/teammates'
import CourseTabBar from '@/components/courses/CourseTabBar'
import TeammatesClient from '@/components/teammates/TeammatesClient'

type Props = {
  params: { id: string }
}

export default async function TeammatesPage({ params }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const course = await getCourse(supabase, params.id)
  if (!course) notFound()

  const teammates = await getTeammates(supabase, params.id)

  return (
    <>
      <CourseTabBar courseId={course.id} courseColor={course.color} />
      <TeammatesClient
        course={{
          id: course.id,
          name: course.name,
          color: course.color,
        }}
        teammates={teammates}
        userId={user.id}
      />
    </>
  )
}
