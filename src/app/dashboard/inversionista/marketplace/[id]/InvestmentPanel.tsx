'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { investInLoan } from './actions'

interface InvestmentPanelProps {
  loanId: string
  amountRequested: number
  amountFunded: number
  interestRateEa: number | null
  termMonths: number | null
}

export default function InvestmentPanel({
  loanId,
  amountRequested,
  amountFunded,
  interestRateEa,
  termMonths
}: InvestmentPanelProps) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const remainingAmount = amountRequested - amountFunded
  const progress = amountRequested > 0 ? (amountFunded / amountRequested) * 100 : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '')
    setAmount(value)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const numericAmount = parseFloat(amount)

    if (!numericAmount || numericAmount <= 0) {
      setError('Ingresa un monto válido.')
      return
    }

    if (numericAmount > remainingAmount) {
      setError(`El monto máximo disponible es ${formatCurrency(remainingAmount)}.`)
      return
    }

    setIsLoading(true)

    try {
      const result = await investInLoan(loanId, numericAmount)

      if (result.success) {
        setSuccess(result.message)
        setAmount('')
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push('/dashboard/inversionista/mis-inversiones')
        }, 2000)
      } else {
        setError(result.error || 'Error al procesar la inversión.')
      }
    } catch {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const quickAmounts = [1000000, 5000000, 10000000, 20000000].filter(a => a <= remainingAmount)

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sticky top-8">
      <h3 className="text-xl font-bold text-white mb-6">Invertir en esta Oportunidad</h3>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Progreso de Recaudo</span>
          <span className="text-primary font-bold">{progress.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-slate-500">Recaudado</span>
            <p className="text-primary font-semibold">{formatCurrency(amountFunded)}</p>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Meta</span>
            <p className="text-white font-semibold">{formatCurrency(amountRequested)}</p>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-900/50 rounded-xl">
        <div>
          <span className="text-slate-500 text-xs">Rentabilidad EA</span>
          <p className="text-primary font-bold text-lg">
            {interestRateEa ? `${interestRateEa}%` : '-'}
          </p>
        </div>
        <div>
          <span className="text-slate-500 text-xs">Plazo</span>
          <p className="text-white font-bold text-lg">
            {termMonths ? `${termMonths} meses` : '-'}
          </p>
        </div>
      </div>

      {/* Remaining Amount */}
      <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <span className="text-emerald-400 text-sm">Disponible para invertir</span>
        <p className="text-emerald-400 font-bold text-2xl">{formatCurrency(remainingAmount)}</p>
      </div>

      {/* Investment Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm text-slate-400 mb-2">
            ¿Cuánto quieres invertir?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="text"
              id="amount"
              value={amount ? Number(amount).toLocaleString('es-CO') : ''}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-lg font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              disabled={isLoading || remainingAmount <= 0}
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        {quickAmounts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {formatCurrency(quickAmount)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount(remainingAmount.toString())}
              className="px-3 py-1.5 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
              disabled={isLoading}
            >
              Máximo
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-400 text-sm">{success}</p>
            <p className="text-emerald-400/70 text-xs mt-1">Redirigiendo...</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !amount || remainingAmount <= 0}
          className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold text-lg rounded-xl transition-colors"
        >
          {isLoading ? 'Procesando...' : 'Confirmar Inversión'}
        </button>

        {remainingAmount <= 0 && (
          <p className="text-center text-slate-500 text-sm mt-3">
            Esta oportunidad ya está completamente financiada.
          </p>
        )}
      </form>

      {/* Disclaimer */}
      <p className="text-slate-500 text-xs mt-6 text-center">
        Al confirmar, reservarás tu cupo. Deberás completar el pago para finalizar la inversión.
      </p>
    </div>
  )
}
