'use client'

import { useState, useTransition } from 'react'
import { login } from '../actions'
import Link from 'next/link'
import Image from 'next/image'

export default function InversionistaLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await login(formData, 'inversionista')
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
          <Link 
            href="/inversionistas" 
            className="text-sm font-medium text-slate-400 hover:text-primary transition-colors"
          >
            Volver
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
                <span className="material-symbols-outlined text-emerald-400 text-lg">trending_up</span>
                <span className="text-sm font-semibold text-emerald-400">Portal Inversionistas</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Bienvenido de nuevo</h1>
              <p className="text-slate-400">Ingresa a tu cuenta de inversor</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-400 text-xl">error</span>
                  <p className="text-sm text-red-300 flex-1">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form action={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label 
                  className="block text-sm font-medium text-slate-300 mb-2" 
                  htmlFor="email"
                >
                  Correo electrónico
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required
                  disabled={isPending}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="inversor@ejemplo.com"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label 
                  className="block text-sm font-medium text-slate-300 mb-2" 
                  htmlFor="password"
                >
                  Contraseña
                </label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  required
                  disabled={isPending}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="remember"
                    disabled={isPending}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800/50 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 disabled:opacity-50"
                  />
                  <span className="text-sm text-slate-400">Recordarme</span>
                </label>
                <Link 
                  href="/login/inversionista/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/50 text-slate-400">¿Nuevo inversor?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link 
                href="/inversionistas" 
                className="text-sm text-slate-400 hover:text-primary transition-colors"
              >
                Regístrate aquí para comenzar a invertir
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <span className="material-symbols-outlined text-lg">lock</span>
            <span>Conexión segura y encriptada</span>
          </div>
        </div>
      </main>
    </div>
  )
}
