'use server'

import { createServiceClient } from '@/lib/supabase/server'

type EventType = 'login' | 'logout' | 'dashboard_view' | 'config_change'

export async function logEvent(
  eventType: EventType,
  userId: string | null,
  userEmail: string | null,
  metadata?: Record<string, unknown>
) {
  try {
    const supabase = await createServiceClient()
    await supabase.from('audit_logs').insert({
      event_type: eventType,
      user_id: userId,
      user_email: userEmail,
      metadata: metadata ?? null,
    })
  } catch (err) {
    console.error('[audit] failed to log event:', err)
  }
}
