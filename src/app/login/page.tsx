'use client'

import { useState, useTransition } from 'react'
import { login } from './actions'
import Link from 'next/link'
import Image from 'next/image'

export default function UnifiedLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="h-12 w-auto relative">
              <Image 
                src="/images/AluriLogo.png" 
                alt="Aluri Logo" 
                width={120}
                height={48}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>
        </div>
      </header>

      {/* Login Section */}
      <main className="min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background Effects */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />
        
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <span className="material-symbols-outlined text-emerald-400 text-lg">login</span>
                <span className="font-semibold text-emerald-400">Acceso Plataforma</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Iniciar Sesión</h2>
              <p className="text-slate-400 text-sm">Ingresa con tu correo y contraseña</p>
            </div>
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {error && <div className="text-red-400 text-sm text-center">{error}</div>}
              <button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary-dark text-slate-900 text-base font-bold rounded-full shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
                disabled={isPending}
              >
                {isPending ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
