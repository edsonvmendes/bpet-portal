import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from '@/actions/audit'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logEvent('login', user.id, user.email ?? null)
  }
  return NextResponse.json({ ok: true })
}
