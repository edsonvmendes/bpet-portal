'use server'

import { createServiceClient } from '@/lib/supabase/server'

export type AuditEvent =
  | 'login'
  | 'logout'
  | 'dashboard_access'
  | 'settings_update'

export async function logAuditEvent({
  userId,
  userEmail,
  event,
  meta,
}: {
  userId?: string | null
  userEmail?: string | null
  event: AuditEvent
  meta?: Record<string, unknown>
}) {
  try {
    const supabase = await createServiceClient()
    await supabase.from('audit_logs').insert({
      user_id: userId ?? null,
      user_email: userEmail ?? null,
      event_type: event,
      metadata: meta ?? null,
    })
  } catch (err) {
    console.error('[audit] Failed to log event:', err)
  }
}