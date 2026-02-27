'use client'

import { useState, useTransition } from 'react'
import { login } from '@/actions/auth'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1"
          style={{ color: 'var(--color-medium)' }}>E-mail</label>
        <input id="email" name="email" type="email" required autoComplete="email"
          placeholder="voce@empresa.com"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none transition focus:ring-2 focus:ring-[#2BBFB3]"
          style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1"
          style={{ color: 'var(--color-medium)' }}>Senha</label>
        <input id="password" name="password" type="password" required autoComplete="current-password"
          placeholder="••••••••"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none transition focus:ring-2 focus:ring-[#2BBFB3]"
          style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }} />
      </div>
      {error && (
        <p className="text-sm rounded-lg px-3 py-2"
          style={{ backgroundColor: '#FEE2E2', color: 'var(--color-danger)', border: '1px solid #FECACA' }}>
          {error}
        </p>
      )}
      <button type="submit" disabled={isPending}
        className="w-full py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60 mt-2 hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}>
        {isPending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
