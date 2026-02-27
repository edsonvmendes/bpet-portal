import { Metadata } from 'next'
import Image from 'next/image'
import LoginForm from '@/components/LoginForm'

export const metadata: Metadata = {
  title: 'Login — BPet Analytics',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image src="/logo_cor.png" alt="BPet" width={180} height={60} priority className="object-contain" />
        </div>
        <div className="rounded-2xl shadow-lg p-8"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h1 className="text-xl font-semibold mb-1 text-center" style={{ color: 'var(--color-foreground)' }}>
            Acesse o Portal
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: 'var(--color-light)' }}>
            Entre com seu e-mail e senha para continuar
          </p>
          <LoginForm />
        </div>
        <p className="text-xs text-center mt-6" style={{ color: 'var(--color-light)' }}>
          © {new Date().getFullYear()} BPet · Acesso restrito
        </p>
      </div>
    </main>
  )
}
