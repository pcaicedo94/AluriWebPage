'use client'

import { useState } from 'react'
import { MapPin, Calendar, Eye, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

interface PropertyInfo {
  address?: string
  city?: string
  property_type?: string
  commercial_value?: number
}

// Payment record from loan_payments table
interface LoanPayment {
  amount_capital: number
  amount_interest: number
}

interface Loan {
  code: string
  status: string
  interest_rate_ea: number | null
  amount_requested: number | null
  amount_funded: number | null
  term_months: number | null
  property_info: PropertyInfo | null
  loan_payments: LoanPayment[]
}

interface Investment {
  id: string
  amount_invested: number
  interest_rate_investor: number | null
  status: string
  created_at: string
  confirmed_at: string | null
  loan_id: string
  loan: Loan | null
}

// Calculate pro-rated values for an investment based on loan payments
function calculateInvestmentProgress(inv: Investment): {
  share: number
  capitalRecuperado: number
  interesesGanados: number
  progressPercent: number
} {
  const loan = inv.loan
  if (!loan || !loan.loan_payments || loan.loan_payments.length === 0) {
    return { share: 0, capitalRecuperado: 0, interesesGanados: 0, progressPercent: 0 }
  }

  const amountRequested = loan.amount_requested || 0
  const amountInvested = inv.amount_invested || 0

  // Calculate investor's share (participation percentage)
  const share = amountRequested > 0 ? amountInvested / amountRequested : 0

  // Sum all payments for this loan
  const totalLoanCapital = loan.loan_payments.reduce((sum, p) => sum + (p.amount_capital || 0), 0)
  const totalLoanInterest = loan.loan_payments.reduce((sum, p) => sum + (p.amount_interest || 0), 0)

  // Pro-rate by investor's share
  const capitalRecuperado = totalLoanCapital * share
  const interesesGanados = totalLoanInterest * share

  // Progress = capital recovered / amount invested (for bullet loans, stays at 0% until final payment)
  const progressPercent = amountInvested > 0 ? (capitalRecuperado / amountInvested) * 100 : 0

  return { share, capitalRecuperado, interesesGanados, progressPercent }
}

interface InvestmentsTabsProps {
  investments: Investment[]
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default function InvestmentsTabs({ investments }: InvestmentsTabsProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active')

  // Filter investments by loan status
  // Active portfolio includes both 'active' (al día) and 'defaulted' (en mora)
  const activeInvestments = investments.filter(
    (inv) => inv.loan?.status === 'active' || inv.loan?.status === 'defaulted'
  )
  // Pending/Historical: fundraising and completed only (defaulted goes to active portfolio)
  const pendingInvestments = investments.filter(
    (inv) => inv.loan?.status === 'fundraising' || inv.loan?.status === 'completed'
  )

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; bgClass: string; textClass: string }> = {
      fundraising: { label: 'Fondeando', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400' },
      active: { label: 'Al día', bgClass: 'bg-emerald-500', textClass: 'text-white' },
      completed: { label: 'Completado', bgClass: 'bg-blue-500/20', textClass: 'text-blue-400' },
      defaulted: { label: 'En Mora', bgClass: 'bg-red-500', textClass: 'text-white' }
    }
    const statusConfig = config[status] || { label: status, bgClass: 'bg-zinc-500/20', textClass: 'text-zinc-400' }

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusConfig.bgClass} ${statusConfig.textClass}`}>
        {statusConfig.label}
      </span>
    )
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-700 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'active'
              ? 'text-teal-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            Portafolio Activo
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'active' ? 'bg-teal-500/20 text-teal-400' : 'bg-zinc-700 text-zinc-400'
            }`}>
              {activeInvestments.length}
            </span>
          </div>
          {activeTab === 'active' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-teal-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={16} />
            En Fondeo / Historico
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'pending' ? 'bg-teal-500/20 text-teal-400' : 'bg-zinc-700 text-zinc-400'
            }`}>
              {pendingInvestments.length}
            </span>
          </div>
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'active' ? (
        <ActiveInvestmentsTable investments={activeInvestments} getStatusBadge={getStatusBadge} />
      ) : (
        <PendingInvestmentsTable investments={pendingInvestments} getStatusBadge={getStatusBadge} />
      )}
    </div>
  )
}

// Tab 1: Portafolio Activo - Shows active investments with payment info
function ActiveInvestmentsTable({
  investments,
  getStatusBadge
}: {
  investments: Investment[]
  getStatusBadge: (status: string) => JSX.Element
}) {
  if (investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-zinc-500 bg-zinc-900 rounded-xl border border-zinc-700">
        <TrendingUp size={40} className="mb-3 opacity-50" />
        <p>No tienes inversiones activas en este momento.</p>
        <p className="text-sm mt-1">Las inversiones aparecen aqui cuando el credito comienza a generar pagos.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700 bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Codigo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Inmueble</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Mi Inversion</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Tasa</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Progreso / Ganancias</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {investments.map((inv) => {
              const loan = inv.loan
              const propertyInfo = loan?.property_info
              const propertyDisplay = propertyInfo?.city || propertyInfo?.address || 'Sin ubicacion'
              const rate = inv.interest_rate_investor || loan?.interest_rate_ea || 0
              const loanStatus = loan?.status || 'pending'

              // Calculate real progress from payments
              const { capitalRecuperado, interesesGanados, progressPercent } = calculateInvestmentProgress(inv)

              return (
                <tr key={inv.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-zinc-800 text-teal-400 text-xs font-mono rounded">
                      {loan?.code || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-zinc-500" />
                      <span className="text-white text-sm">{propertyDisplay}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-white font-medium">{formatCOP(inv.amount_invested)}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-teal-400 font-medium">{rate.toFixed(1)}% E.A.</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getStatusBadge(loanStatus)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-36">
                      {/* Progress bar */}
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-500">Capital: {progressPercent.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progressPercent >= 100 ? 'bg-emerald-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${Math.min(100, progressPercent)}%` }}
                        />
                      </div>
                      {/* Earnings display */}
                      <div className="text-xs">
                        <span className="text-amber-400 font-medium">
                          Intereses: {formatCOP(interesesGanados)}
                        </span>
                      </div>
                      {capitalRecuperado > 0 && (
                        <div className="text-xs mt-0.5">
                          <span className="text-blue-400">
                            Recuperado: {formatCOP(capitalRecuperado)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link
                      href={`/dashboard/inversionista/mis-inversiones/${loan?.code || inv.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition-colors"
                    >
                      <Eye size={14} />
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Tab 2: En Fondeo / Historico - Shows fundraising and completed investments
function PendingInvestmentsTable({
  investments,
  getStatusBadge
}: {
  investments: Investment[]
  getStatusBadge: (status: string) => JSX.Element
}) {
  if (investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-zinc-500 bg-zinc-900 rounded-xl border border-zinc-700">
        <Clock size={40} className="mb-3 opacity-50" />
        <p>No tienes inversiones en fondeo o historicas.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700 bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Codigo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Inmueble</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Mi Inversion</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Progreso Fondeo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Fecha</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {investments.map((inv) => {
              const loan = inv.loan
              const propertyInfo = loan?.property_info
              const propertyDisplay = propertyInfo?.city || propertyInfo?.address || 'Sin ubicacion'
              const loanStatus = loan?.status || 'pending'

              // Calculate funding progress
              const requested = loan?.amount_requested || 0
              const funded = loan?.amount_funded || 0
              const fundingProgress = requested > 0 ? (funded / requested) * 100 : 0

              const investmentDate = inv.confirmed_at || inv.created_at

              return (
                <tr key={inv.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-zinc-800 text-teal-400 text-xs font-mono rounded">
                      {loan?.code || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-zinc-500" />
                      <span className="text-white text-sm">{propertyDisplay}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-white font-medium">{formatCOP(inv.amount_invested)}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getStatusBadge(loanStatus)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-500">{fundingProgress.toFixed(0)}%</span>
                        <span className="text-zinc-500">{formatCOP(funded)}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            fundingProgress >= 100 ? 'bg-emerald-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${Math.min(100, fundingProgress)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar size={14} />
                      <span>{formatDate(investmentDate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link
                      href={`/dashboard/inversionista/mis-inversiones/${loan?.code || inv.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition-colors"
                    >
                      <Eye size={14} />
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
