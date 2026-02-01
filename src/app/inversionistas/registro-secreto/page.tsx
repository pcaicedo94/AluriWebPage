'use client'

import { useState } from 'react'
import { registrarInversionista } from '../actions'
import Link from 'next/link'

export default function RegistroSecretoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData(form)
      const result = await registrarInversionista(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(result.message || 'Cuenta creada exitosamente')
        form.reset()
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error al crear la cuenta. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <Link href="/inversionistas" className="text-primary hover:underline text-sm">
            &larr; Volver a Inversionistas
          </Link>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
          <p className="text-red-400 text-sm font-medium">
            Pagina de prueba - No compartir este enlace
          </p>
        </div>

        <h1 className="text-2xl font-bold mb-6">Registro de Inversionista (Test)</h1>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2" htmlFor="fullName">
                Nombre Completo *
              </label>
              <input
                className="w-full px-4 h-12 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                id="fullName"
                name="fullName"
                required
                type="text"
                placeholder="Maria Gonzalez Lopez"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2" htmlFor="telefono">
                Telefono *
              </label>
              <input
                className="w-full px-4 h-12 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                id="telefono"
                name="telefono"
                required
                type="tel"
                placeholder="300 123 4567"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2" htmlFor="email">
              Correo Electronico *
            </label>
            <input
              className="w-full px-4 h-12 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              id="email"
              name="email"
              required
              type="email"
              placeholder="maria.gonzalez@ejemplo.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2" htmlFor="password">
              Contrasena *
            </label>
            <input
              className="w-full px-4 h-12 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              id="password"
              name="password"
              required
              type="password"
              minLength={6}
              placeholder="Minimo 6 caracteres"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2" htmlFor="ciudad">
                Ciudad
              </label>
              <input
                className="w-full px-4 h-12 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                id="ciudad"
                name="ciudad"
                type="text"
                placeholder="Ej: Bogota, Medellin, Cali"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2" htmlFor="montoInversion">
                Monto Disponible para Invertir
              </label>
              <input
                className="w-full px-4 h-12 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                id="montoInversion"
                name="montoInversion"
                type="text"
                placeholder="$50.000.000"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <p className="text-primary text-sm">{success}</p>
            </div>
          )}

          <button
            className="w-full flex items-center justify-center px-8 h-14 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-slate-900 text-lg font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] disabled:translate-y-0"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta de Inversionista'}
          </button>
        </form>
      </div>
    </div>
  )
}
