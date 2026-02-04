'use client'

import { FileText } from 'lucide-react'
import { LoanData } from './actions'
import Link from 'next/link'

interface LoansTableProps {
  loans: LoanData[]
}

export default function LoansTable({ loans }: LoansTableProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: {
        label: 'Borrador',
        className: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      },
      pending: {
        label: 'Pendiente',
        className: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
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
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
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

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const renderDaysPastDue = (days: number | null) => {
    if (days === null || days === undefined || days === 0) {
      return <span className="text-slate-400">0</span>
    }
    return <span className="text-red-500 font-bold">{days}</span>
  }

  return (
    <>
      {loans.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-700 uppercase tracking-wider">
                <th className="pb-4 px-3 font-medium">Codigo</th>
                <th className="pb-4 px-3 font-medium">Deudor</th>
                <th className="pb-4 px-3 font-medium text-right">Monto Solicitado</th>
                <th className="pb-4 px-3 font-medium text-right">Valor Garantia</th>
                <th className="pb-4 px-3 font-medium text-center">Estado</th>
                <th className="pb-4 px-3 font-medium text-center">Dias Mora</th>
                <th className="pb-4 px-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loans.map((loan) => (
                <tr key={loan.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-4 px-3">
                    <span className="font-mono font-semibold text-emerald-400">
                      {loan.code}
                    </span>
                  </td>
                  <td className="py-4 px-3 font-medium text-white">
                    {loan.deudor || 'Sin asignar'}
                  </td>
                  <td className="py-4 px-3 text-right text-white font-medium">
                    {formatCurrency(loan.amount_requested)}
                  </td>
                  <td className="py-4 px-3 text-right text-slate-300">
                    {formatCurrency(loan.valor_garantia)}
                  </td>
                  <td className="py-4 px-3 text-center">
                    {getStatusBadge(loan.status)}
                  </td>
                  <td className="py-4 px-3 text-center">
                    {renderDaysPastDue(loan.days_past_due)}
                  </td>
                  <td className="py-4 px-3 text-center">
                    <Link
                      href={`/dashboard/admin/creditos/${loan.id}`}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg border border-amber-500/30 transition-colors inline-block"
                    >
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <FileText size={48} className="mb-4 opacity-50" />
          <p>No se encontraron creditos.</p>
        </div>
      )}
    </>
  )
}
