'use client'

import { useState } from 'react'
import { registrarInversionista } from './actions'

export default function SignupForm() {
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

  // Registration temporarily disabled - only admin can create accounts
  return (
    <div className="bg-slate-800/50 rounded-3xl p-8 md:p-12 border border-slate-700 text-center">
      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">Registro Exclusivo</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Actualmente el registro de inversionistas es por invitacion.
        Si estas interesado en invertir con nosotros, contactanos para crear tu cuenta.
      </p>
      <a
        href="mailto:contacto@aluri.co"
        className="inline-flex items-center justify-center px-8 h-14 bg-primary hover:bg-primary-dark text-slate-900 text-lg font-bold rounded-full shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px]"
      >
        Contactar para Registro
      </a>
      <p className="text-center text-sm text-slate-500 mt-6">
        Si ya tienes cuenta, <a href="/login" className="text-primary hover:underline">inicia sesion aqui</a>
      </p>
    </div>
  )
}
