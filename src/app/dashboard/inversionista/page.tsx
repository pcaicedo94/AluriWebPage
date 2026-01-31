import { createClient } from '../../../utils/supabase/server'
import { TrendingUp, Briefcase, Percent } from 'lucide-react'
import PortfolioChart from '../../../components/dashboard/PortfolioChart'

interface Investment {
  id: string
  amount_invested: number
  roi_percentage: number
  created_at: string
  loan_id: string
  loans: {
    code: string
    status: string
    interest_rate: number
    total_amount: number
    start_date: string
    next_payment_date: string | null
    amount_overdue: number | null
  } | null
}

export default async function InvestorDashboard() {
  const supabase = await createClient()

  // User is already verified in layout.tsx
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawData, error } = await supabase
    .from('investments')
    .select(`
      id,
      amount_invested,
      roi_percentage,
      created_at,
      loan_id,
      loans (
        code,
        status,
        interest_rate,
        total_amount,
        start_date,
        next_payment_date,
        amount_overdue
      )
    `)
    .eq('investor_id', user?.id)

  if (error) {
    console.error('Error fetching investments:', JSON.stringify(error, null, 2))
  }

  const investments = (rawData || []) as unknown as Investment[]

  // Calculations
  const totalInvested = investments.reduce((sum, item) => sum + Number(item.amount_invested), 0)
  const activeProjects = investments.filter(i => i.loans?.status === 'active').length

  const weightedRoi = totalInvested > 0
    ? investments.reduce((acc, item) => acc + (Number(item.amount_invested) * Number(item.roi_percentage)), 0) / totalInvested
    : 0

  const totalExpectedReturn = investments.reduce((acc, item) => {
    return acc + (Number(item.amount_invested) * (1 + Number(item.roi_percentage) / 100))
  }, 0)

  const simulatedCollected = totalExpectedReturn * 0.15

  return (
    <div className="text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Bienvenido, Usuario</h1>
        <p className="text-zinc-500 mt-1">
          Resumen de tus inversiones y rendimiento actual.
        </p>
      </header>

      {/* KPIs - All in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 min-h-[160px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Balance Total</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              ${totalInvested.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 min-h-[160px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Retorno Anual</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Percent size={20} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{weightedRoi.toFixed(1)}%</p>
            <p className="text-zinc-500 text-sm mt-1">Promedio ponderado</p>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 min-h-[160px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Inversiones Activas</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Briefcase size={20} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{activeProjects}</p>
            <p className="text-zinc-500 text-sm mt-1">Proyectos financiados</p>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 min-h-[160px] flex flex-col">
          <h2 className="text-zinc-500 text-sm mb-2">Distribucion</h2>
          <div className="flex-1">
            <PortfolioChart invested={totalInvested} collected={simulatedCollected} />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
        <h2 className="text-lg font-semibold mb-6 text-white">Active Investments</h2>

          {investments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-zinc-500 text-sm border-b border-zinc-700">
                    <th className="pb-4 font-medium">ID</th>
                    <th className="pb-4 font-medium">INMUEBLE</th>
                    <th className="pb-4 font-medium">MONTO</th>
                    <th className="pb-4 font-medium">ESTADO</th>
                    <th className="pb-4 font-medium">PROX PAGO</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {investments.map((inv) => {
                    const amountOverdue = Number(inv.loans?.amount_overdue || 0)
                    const isEnMora = amountOverdue > 0
                    const statusText = isEnMora ? 'En mora' : 'Al día'

                    return (
                      <tr key={inv.id} className="border-b border-zinc-700/50 hover:bg-zinc-800/30">
                        <td className="py-4 text-zinc-400">
                          #{inv.loans?.code || 'N/A'}
                        </td>
                        <td className="py-4 font-medium text-white">
                          {inv.loans?.code || 'N/A'}
                        </td>
                        <td className="py-4 text-white">
                          ${Number(inv.amount_invested).toLocaleString('es-CO', { minimumFractionDigits: 3 })}
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded text-xs font-medium ${
                            isEnMora
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="py-4 text-zinc-400">
                          {inv.loans?.next_payment_date ? new Date(inv.loans.next_payment_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Briefcase size={48} className="mb-4 opacity-50" />
              <p>No se encontraron inversiones.</p>
            </div>
          )}
      </div>
    </div>
  )
}
