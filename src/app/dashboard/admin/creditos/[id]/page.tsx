import { getLoanById, getLoanCosigners, getLoanInvestments } from '../actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import LoanDetailTabs from './LoanDetailTabs'
import PublishButton from './PublishButton'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LoanDetailPage({ params }: PageProps) {
  const { id } = await params

  // Fetch all data in parallel
  const [loanResult, cosignersResult, investmentsResult] = await Promise.all([
    getLoanById(id),
    getLoanCosigners(id),
    getLoanInvestments(id)
  ])

  if (loanResult.error || !loanResult.data) {
    notFound()
  }

  const loan = loanResult.data
  const cosigners = cosignersResult.data || []
  const investments = investmentsResult.data || []

  // Calculate funding progress
  const amountRequested = loan.amount_requested || 0
  const amountFunded = loan.amount_funded || 0
  const fundingProgress = amountRequested > 0 ? (amountFunded / amountRequested) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      draft: {
        label: 'Borrador',
        className: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
      },
      fundraising: {
        label: 'En Recaudo',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      },
      active: {
        label: 'Activo',
        className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      },
      late: {
        label: 'En Mora',
        className: 'bg-red-500/20 text-red-400 border-red-500/30'
      },
      paid: {
        label: 'Pagado',
        className: 'bg-primary/20 text-primary border-primary/30'
      },
      defaulted: {
        label: 'Incumplido',
        className: 'bg-red-600/20 text-red-500 border-red-600/30'
      },
      cancelled: {
        label: 'Cancelado',
        className: 'bg-slate-600/20 text-slate-500 border-slate-600/30'
      }
    }
    return configs[status] || { label: status, className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
  }

  const statusConfig = getStatusConfig(loan.status)

  return (
    <div className="text-white p-8">
      {/* Back Link */}
      <Link
        href="/dashboard/admin/creditos"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Volver a Creditos</span>
      </Link>

      {/* Header */}
      <header className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-amber-400">{loan.code}</h1>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-slate-400">
              Deudor: <span className="text-white font-medium">{loan.owner?.full_name || 'Sin asignar'}</span>
              {loan.owner?.email && (
                <span className="text-slate-500 ml-2">({loan.owner.email})</span>
              )}
            </p>
          </div>

          {/* Action Button - Only show for draft status */}
          {loan.status === 'draft' && (
            <PublishButton loanId={loan.id} />
          )}
        </div>
      </header>

      {/* Funding Progress Bar */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">Progreso de Recaudo</h3>
          <span className="text-2xl font-bold text-primary">{fundingProgress.toFixed(1)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(fundingProgress, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <div>
            <span className="text-slate-400">Fondeado: </span>
            <span className="text-primary font-semibold">{formatCurrency(amountFunded)}</span>
          </div>
          <div>
            <span className="text-slate-400">Meta: </span>
            <span className="text-white font-semibold">{formatCurrency(amountRequested)}</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <LoanDetailTabs
        loan={loan}
        cosigners={cosigners}
        investments={investments}
      />
    </div>
  )
}
