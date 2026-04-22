import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCourses } from '@/lib/supabase/queries/courses'
import CoursesGalaxyClient from '@/components/courses/CoursesGalaxyClient'

export default async function CoursesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const courses = await getCourses(supabase, user.id)

  return <CoursesGalaxyClient courses={courses} userId={user.id} />
}
