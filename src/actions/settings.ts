'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logEvent } from './audit'
import type { PortalSettings } from '@/lib/types'

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sem permissão.' }

  const portal_title = (formData.get('portal_title') as string) || 'BPet Analytics'
  const report_id    = (formData.get('report_id')    as string) || null
  const embed_url    = (formData.get('embed_url')    as string) || null
  const active_mode  = (formData.get('active_mode')  as 'report_id' | 'embed_url') || 'report_id'

  const svc = await createServiceClient()
  const { data: before } = await svc.from('portal_settings').select('*').eq('id', 1).single()

  const after: Partial<PortalSettings> = {
    portal_title, report_id, embed_url, active_mode,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  const { error } = await svc.from('portal_settings').update(after).eq('id', 1)
  if (error) return { error: 'Falha ao salvar: ' + error.message }

  await logEvent('config_change', user.id, user.email ?? null, {
    before: { portal_title: before?.portal_title, report_id: before?.report_id, active_mode: before?.active_mode },
    after:  { portal_title, report_id, active_mode },
  })

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}
