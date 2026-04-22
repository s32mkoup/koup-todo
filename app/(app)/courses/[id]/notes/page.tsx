import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/supabase/queries/courses'
import { getNotes } from '@/lib/supabase/queries/notes'
import CourseTabBar from '@/components/courses/CourseTabBar'
import NotesClient from '@/components/notes/NotesClient'

type Props = {
  params: { id: string }
}

export default async function NotesPage({ params }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const course = await getCourse(supabase, params.id)
  if (!course) notFound()

  const notes = await getNotes(supabase, params.id)

  return (
    <>
      <CourseTabBar courseId={course.id} courseColor={course.color} />
      <NotesClient
        course={{
          id: course.id,
          name: course.name,
          color: course.color,
        }}
        notes={notes}
        userId={user.id}
      />
    </>
  )
}
