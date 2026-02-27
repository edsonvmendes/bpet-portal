import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Acesso Negado — BPet Analytics',
  robots: { index: false, follow: false },
}

export default function AcessoNegadoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Image src="/logo_cor.png" alt="BPet" width={140} height={46} className="object-contain" />
        </div>
        <div className="rounded-2xl p-8 shadow-lg"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
            Acesso negado
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-light)' }}>
            Você não tem permissão para acessar esta página.
          </p>
          <Link href="/dashboard"
            className="inline-block px-5 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
