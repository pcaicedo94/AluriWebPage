'use client'

import { useState } from 'react'
import { Rocket } from 'lucide-react'
import { publishLoan } from '../actions'
import { useRouter } from 'next/navigation'

interface PublishButtonProps {
  loanId: string
}

export default function PublishButton({ loanId }: PublishButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handlePublish = async () => {
    setIsLoading(true)
    try {
      const result = await publishLoan(loanId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Error al publicar el credito')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error al publicar el credito')
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
      >
        <Rocket size={20} />
        Publicar en Marketplace
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Publicar Credito</h3>
              <p className="text-slate-400">
                Al publicar este credito, estara disponible para que los inversionistas puedan fondearlo en el marketplace.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-semibold rounded-lg transition-colors"
              >
                {isLoading ? 'Publicando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
