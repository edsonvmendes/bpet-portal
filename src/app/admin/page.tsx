import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import AdminClient from '@/components/AdminClient'
import type { PortalSettings, AuditLog } from '@/lib/types'

export const metadata = {
  title: 'Admin — BPet Analytics',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/acesso-negado')

  const svc = await createServiceClient()

  const { data: settings } = await svc
    .from('portal_settings')
    .select('*')
    .eq('id', 1)
    .single()

  const { data: logs } = await svc
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <AdminClient
      settings={settings as PortalSettings | null}
      auditLogs={(logs ?? []) as AuditLog[]}
      userEmail={user.email ?? ''}
    />
  )
}
