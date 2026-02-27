import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logEvent } from '@/actions/audit'

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { portal_title, report_id, embed_url, active_mode } = body

  const svc = await createServiceClient()
  const { data: before } = await svc.from('portal_settings').select('*').eq('id', 1).single()

  const { error } = await svc.from('portal_settings')
    .update({ portal_title, report_id, embed_url, active_mode, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logEvent('config_change', user.id, user.email ?? null, {
    before: { portal_title: before?.portal_title, report_id: before?.report_id, active_mode: before?.active_mode },
    after:  { portal_title, report_id, active_mode },
  })

  return NextResponse.json({ ok: true })
}
