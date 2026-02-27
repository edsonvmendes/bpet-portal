import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildEmbedUrl } from '@/lib/powerbi'
import { logEvent } from '@/actions/audit'
import DashboardClient from '@/components/DashboardClient'
import type { PortalSettings } from '@/lib/types'

export const metadata = {
  title: 'Dashboard — BPet Analytics',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase.from('portal_settings').select('*').eq('id', 1).single(),
    supabase.from('user_profiles').select('role').eq('id', user.id).single(),
  ])

  const portalSettings = settings as PortalSettings | null

  logEvent('dashboard_view', user.id, user.email ?? null)

  const embedUrl = portalSettings ? buildEmbedUrl({
    active_mode: portalSettings.active_mode,
    report_id:   portalSettings.report_id,
    embed_url:   portalSettings.embed_url,
  }) : null

  return (
    <DashboardClient
      userEmail={user.email ?? ''}
      portalTitle={portalSettings?.portal_title ?? 'BPet Analytics'}
      embedUrl={embedUrl}
      isAdmin={profile?.role === 'admin'}
    />
  )
}
