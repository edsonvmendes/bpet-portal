import Link from 'next/link'
export const metadata = { title: 'Acesso Negado — B3.Pet Analytics' }

export default function AccessDenied() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-dark)' }}>
          Acesso Negado
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-medium)' }}>
          Você não tem permissão para acessar esta página.
        </p>
        <Link href="/dashboard"
          className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          Voltar ao Dashboard
        </Link>
      </div>
    </main>
  )
}
