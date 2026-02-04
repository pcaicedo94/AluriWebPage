import { getLoans } from './actions'
import { FileText, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react'
import LoansTable from './LoansTable'
import Link from 'next/link'

export default async function AdminCreditosPage() {
  const { data: loans, error } = await getLoans()

  if (error) {
    console.error('Error fetching loans:', error)
  }

  const loansList = loans || []

  // Calculate stats
  const totalLoans = loansList.length
  const activeLoans = loansList.filter(l => l.status === 'active').length
  const lateLoans = loansList.filter(l => l.status === 'late').length
  const draftLoans = loansList.filter(l => l.status === 'draft').length

  // Calculate total amounts
  const totalAmountRequested = loansList.reduce((sum, l) => sum + (l.amount_requested || 0), 0)
  const totalLateAmount = loansList
    .filter(l => l.status === 'late')
    .reduce((sum, l) => sum + (l.amount_requested || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="text-white p-8">
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Gestion de Creditos</h1>
          <p className="text-slate-400 mt-1">
            Administra los creditos y su estado
          </p>
        </div>
        <Link
          href="/dashboard/admin/creditos/nuevo"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Credito</span>
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
              <FileText size={24} />
            </div>
            <span className="text-slate-400 text-sm">Total Creditos</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalLoans}</p>
          <p className="text-xs text-slate-500 mt-1">{formatCurrency(totalAmountRequested)}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
              <CheckCircle size={24} />
            </div>
            <span className="text-slate-400 text-sm">Creditos Activos</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeLoans}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-500/10 rounded-full text-red-400">
              <AlertTriangle size={24} />
            </div>
            <span className="text-slate-400 text-sm">En Mora</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{lateLoans}</p>
          <p className="text-xs text-red-400/70 mt-1">{formatCurrency(totalLateAmount)}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-400">
              <Clock size={24} />
            </div>
            <span className="text-slate-400 text-sm">Borradores</span>
          </div>
          <p className="text-3xl font-bold text-white">{draftLoans}</p>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-6">Listado de Creditos</h2>
        <LoansTable loans={loansList} />
      </div>
    </div>
  )
}
