import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BackstageTabs from '@/components/BackstageTabs'

export const metadata = {
  title: 'Backstage — BPet Analytics',
  robots: { index: false, follow: false },
}

export default async function BackstagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/acesso-negado')

  return <BackstageTabs userEmail={user.email ?? ''} />
}
