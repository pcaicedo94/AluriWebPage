'use client'

import { useState, useTransition } from 'react'
import { login } from '../actions'
import Link from 'next/link'
import Image from 'next/image'

export default function PropietarioLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await login(formData, 'propietario')
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="font-display bg-background-light text-text-main antialiased selection:bg-primary selection:text-text-main">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="h-12 w-auto">
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
            href="/propietarios" 
            className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
          >
            Volver
          </Link>
        </div>
      </header>

      {/* Login Section */}
      <main className="min-h-screen flex items-center justify-center px-6 pt-20 bg-background-subtle">
        {/* Background Effects */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />
        
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
                <span className="material-symbols-outlined text-blue-600 text-lg">home</span>
                <span className="text-sm font-semibold text-blue-600">Portal Propietarios</span>
              </div>
              <h1 className="text-3xl font-bold text-text-main mb-2">Bienvenido de nuevo</h1>
              <p className="text-text-muted">Ingresa a tu cuenta de propietario</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-600 text-xl">error</span>
                  <p className="text-sm text-red-700 flex-1">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form action={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label 
                  className="block text-sm font-medium text-text-main mb-2" 
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
                  className="w-full px-4 py-3 bg-background-light border border-slate-300 rounded-xl text-text-main placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="propietario@ejemplo.com"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label 
                  className="block text-sm font-medium text-text-main mb-2" 
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
                  className="w-full px-4 py-3 bg-background-light border border-slate-300 rounded-xl text-text-main placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 disabled:opacity-50"
                  />
                  <span className="text-sm text-text-muted">Recordarme</span>
                </label>
                <Link 
                  href="/login/propietario/forgot-password" 
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-text-main font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-text-main border-t-transparent rounded-full animate-spin" />
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
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-text-muted">¿Nuevo propietario?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link 
                href="/propietarios" 
                className="text-sm text-text-muted hover:text-primary transition-colors"
              >
                Solicita tu crédito aquí
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 flex items-center justify-center gap-2 text-text-muted text-sm">
            <span className="material-symbols-outlined text-lg">lock</span>
            <span>Conexión segura y encriptada</span>
          </div>
        </div>
      </main>
    </div>
  )
}
