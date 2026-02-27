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
  metadata,
}: {
  userId?: string | null
  userEmail?: string | null
  event: AuditEvent
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = createServiceClient()
    await supabase.from('audit_logs').insert({
      user_id:    userId    ?? null,
      user_email: userEmail ?? null,
      event_type: event,              // ← coluna correta no banco
      metadata:   metadata  ?? null,
    })
  } catch (err) {
    console.error('[audit] Failed to log event:', err)
  }
}
