import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/supabase/queries/courses'
import { getGrades } from '@/lib/supabase/queries/grades'
import CourseTabBar from '@/components/courses/CourseTabBar'
import GradesClient from '@/components/grades/GradesClient'

type Props = {
  params: { id: string }
}

export default async function GradesPage({ params }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const course = await getCourse(supabase, params.id)
  if (!course) notFound()

  const grades = await getGrades(supabase, params.id)

  return (
    <>
      <CourseTabBar courseId={course.id} courseColor={course.color} />
      <GradesClient
        course={{
          id: course.id,
          name: course.name,
          color: course.color,
        }}
        grades={grades}
        userId={user.id}
      />
    </>
  )
}
