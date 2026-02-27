'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from './audit'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'E-mail ou senha incorretos. Tente novamente.' }
  }

  await logEvent('login', data.user.id, data.user.email ?? null)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logEvent('logout', user.id, user.email ?? null)
  }
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
