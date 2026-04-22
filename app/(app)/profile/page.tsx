import ProfileClient from '@/components/profile/ProfileClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, telegram_chat_id')
    .eq('id', user.id)
    .maybeSingle()

  const displayName =
    profile?.name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Student'

  return (
    <ProfileClient
      userId={user.id}
      name={displayName}
      email={user.email ?? ''}
      telegramChatId={profile?.telegram_chat_id ?? ''}
    />
  )
}
