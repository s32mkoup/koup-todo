import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/supabase/queries/courses'
import { getHomework } from '@/lib/supabase/queries/homework'
import CourseTabBar from '@/components/courses/CourseTabBar'
import HomeworkClient from '@/components/courses/HomeworkClient'

type Props = {
  params: { id: string }
}

export default async function HomeworkPage({ params }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const course = await getCourse(supabase, params.id)
  if (!course) notFound()

  const homework = await getHomework(supabase, params.id)

  return (
    <>
      <CourseTabBar courseId={course.id} courseColor={course.color} />
      <HomeworkClient
        course={{
          id: course.id,
          name: course.name,
          color: course.color,
        }}
        homework={homework}
        userId={user.id}
      />
    </>
  )
}
