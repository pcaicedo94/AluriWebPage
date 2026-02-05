import { Users, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { createClient } from '../../../utils/supabase/server'

// Helper para formatear moneda
function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Usuarios Totales
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 2. Créditos Activos (status = 'active' o 'fundraising')
  const { count: activeLoans } = await supabase
    .from('loans')
    .select('*', { count: 'exact', head: true })
    .in('status', ['active', 'fundraising'])

  // 3. Capital Total (suma de amount_funded de todos los loans)
  const { data: loansData } = await supabase
    .from('loans')
    .select('amount_funded')

  const totalCapital = loansData?.reduce((sum, loan) => sum + (loan.amount_funded || 0), 0) || 0

  // 4. Créditos En Mora (status = 'defaulted')
  const { count: defaultedLoans } = await supabase
    .from('loans')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'defaulted')

  // 5. Actividad Reciente - últimas inversiones
  const { data: recentInvestments } = await supabase
    .from('investments')
    .select(`
      id,
      amount_invested,
      created_at,
      investor:profiles!investor_id (full_name, email),
      loan:loans!loan_id (code, property_info)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="text-white p-8">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-emerald-400">Panel de Administracion</h1>
        <p className="text-slate-400 mt-1">
          Bienvenido, Administrador
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
              <Users size={24} />
            </div>
            <span className="text-slate-400 text-sm">Usuarios Totales</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalUsers ?? 0}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
              <FileText size={24} />
            </div>
            <span className="text-slate-400 text-sm">Creditos Activos</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeLoans ?? 0}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
              <TrendingUp size={24} />
            </div>
            <span className="text-slate-400 text-sm">Capital Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCOP(totalCapital)}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-500/10 rounded-full text-red-400">
              <AlertCircle size={24} />
            </div>
            <span className="text-slate-400 text-sm">En Mora</span>
          </div>
          <p className="text-3xl font-bold text-white">{defaultedLoans ?? 0}</p>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-6">Actividad Reciente</h2>
        {recentInvestments && recentInvestments.length > 0 ? (
          <div className="space-y-4">
            {recentInvestments.map((investment) => {
              // Supabase puede devolver objeto o array dependiendo de la relación
              const investorData = investment.investor
              const loanData = investment.loan

              // Extraer datos del inversor
              const investorName = Array.isArray(investorData)
                ? investorData[0]?.full_name || investorData[0]?.email
                : (investorData as { full_name?: string; email?: string } | null)?.full_name ||
                  (investorData as { full_name?: string; email?: string } | null)?.email

              // Extraer datos del préstamo
              const loanCode = Array.isArray(loanData)
                ? loanData[0]?.code
                : (loanData as { code?: string } | null)?.code

              const loanCity = Array.isArray(loanData)
                ? loanData[0]?.property_info?.city
                : (loanData as { property_info?: { city?: string } } | null)?.property_info?.city

              return (
                <div key={investment.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <TrendingUp size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {investorName || 'Usuario'}
                      </p>
                      <p className="text-slate-400 text-sm">
                        Invirtió en {loanCode || 'Crédito'}
                        {loanCity ? ` - ${loanCity}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">{formatCOP(investment.amount_invested)}</p>
                    <p className="text-slate-500 text-xs">
                      {new Date(investment.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <p>No hay actividad reciente</p>
          </div>
        )}
      </div>
    </div>
  )
}
