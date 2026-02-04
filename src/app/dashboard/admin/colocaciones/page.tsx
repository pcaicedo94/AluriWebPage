import { getRecentManualInvestments } from './actions'
import ManualInvestmentForm from './ManualInvestmentForm'
import { FileText, Clock, TrendingUp, Users } from 'lucide-react'

export default async function ColocacionesPage() {
  const { data: recentInvestments } = await getRecentManualInvestments()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Calculate stats
  const totalAmount = recentInvestments.reduce((sum, inv) => sum + (inv.amount_invested || 0), 0)
  const uniqueInvestors = new Set(recentInvestments.map(inv => inv.investor?.email)).size
  const uniqueLoans = new Set(recentInvestments.map(inv => inv.loan?.code)).size

  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Colocaciones Manuales</h1>
        <p className="text-slate-400 mt-2">
          Registra inversiones realizadas fuera de la plataforma digital
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Total Colocado (Últimas 10)</p>
              <p className="text-2xl font-bold text-teal-400 mt-1">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="p-3 bg-teal-500/10 rounded-xl">
              <TrendingUp size={24} className="text-teal-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Inversionistas Activos</p>
              <p className="text-3xl font-bold text-white mt-1">{uniqueInvestors}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Users size={24} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Créditos con Inversión</p>
              <p className="text-3xl font-bold text-white mt-1">{uniqueLoans}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <FileText size={24} className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ManualInvestmentForm />
        </div>

        {/* Recent Investments Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              <h2 className="text-lg font-semibold text-white">Últimas Colocaciones</h2>
            </div>

            {recentInvestments.length === 0 ? (
              <div className="p-6 text-center">
                <FileText size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No hay colocaciones recientes</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {recentInvestments.map(investment => (
                  <div key={investment.id} className="px-6 py-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {investment.investor?.full_name || 'Sin nombre'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 bg-slate-800 text-teal-400 text-xs font-mono rounded">
                            {investment.loan?.code || '-'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDate(investment.created_at)}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-teal-400 ml-3">
                        {formatCurrency(investment.amount_invested)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
