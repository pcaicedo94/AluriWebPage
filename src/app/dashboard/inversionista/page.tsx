import { createClient } from '../../../utils/supabase/server'
import { TrendingUp, Briefcase, Percent, MapPin } from 'lucide-react'
import PortfolioChart from '../../../components/dashboard/PortfolioChart'

interface PropertyInfo {
  address?: string
  city?: string
  property_type?: string
  commercial_value?: number
}

interface LoanData {
  code: string
  status: string
  interest_rate_ea: number | null
  amount_requested: number | null
  amount_funded: number | null
  term_months: number | null
  property_info: PropertyInfo | null
}

interface Investment {
  id: string
  amount_invested: number
  interest_rate_investor: number | null
  status: string
  created_at: string
  loan_id: string
  loan: LoanData | null
}

export default async function InvestorDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  const userName = profile?.full_name?.split(' ')[0] || 'Inversionista'

  // CONSULTA MANUAL SIN FILTROS (INICIO)
  const { data: investments, error } = await supabase
    .from('investments')
    .select('*, loan:loans!inner(*)')
    .eq('investor_id', user?.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching investments:', JSON.stringify(error, null, 2))
  }

  const investmentsData = (investments || []) as unknown as Investment[]

  // Calculations - include both active and defaulted loans in active count
  const totalInvested = investmentsData.reduce((sum, item) => sum + Number(item.amount_invested || 0), 0)
  const activeProjects = investmentsData.filter(i => 
    i.loan?.status === 'active' || 
    i.loan?.status === 'defaulted' || 
    i.loan?.status === 'fundraising'
  ).length

  // Calculate weighted average ROI based on interest_rate_investor or loan's interest_rate_ea
  const weightedRoi = totalInvested > 0
    ? investmentsData.reduce((acc, item) => {
        const rate = item.interest_rate_investor || item.loan?.interest_rate_ea || 0
        return acc + (Number(item.amount_invested) * Number(rate))
      }, 0) / totalInvested
    : 0

  // Calculate expected return (simple calculation based on annual rate)
  const totalExpectedReturn = investmentsData.reduce((acc, item) => {
    const rate = item.interest_rate_investor || item.loan?.interest_rate_ea || 0
    return acc + (Number(item.amount_invested) * (1 + Number(rate) / 100))
  }, 0)

  const simulatedCollected = totalExpectedReturn * 0.15

  return (
    <div className="text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Bienvenido, {userName}</h1>
        <p className="text-zinc-500 mt-1">
          Resumen de tus inversiones y rendimiento actual.
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 min-h-[160px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Balance Total</span>
            <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              ${totalInvested.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 min-h-[160px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Retorno Anual (E.A.)</span>
            <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
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
            <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
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

      {/* Investments Table */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
        <h2 className="text-lg font-semibold mb-6 text-white">Mis Inversiones</h2>

        {investmentsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-500 text-sm border-b border-zinc-700">
                  <th className="pb-4 font-medium">CODIGO</th>
                  <th className="pb-4 font-medium">INMUEBLE</th>
                  <th className="pb-4 font-medium">MI INVERSION</th>
                  <th className="pb-4 font-medium">TASA</th>
                  <th className="pb-4 font-medium">PROGRESO</th>
                  <th className="pb-4 font-medium">ESTADO</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {investmentsData.map((inv) => {
                  const loanStatus = inv.loan?.status || 'pending'
                  const requested = inv.loan?.amount_requested || 0
                  const funded = inv.loan?.amount_funded || 0
                  const progress = requested > 0 ? (funded / requested) * 100 : 0
                  const propertyInfo = inv.loan?.property_info
                  const propertyDisplay = propertyInfo?.city || propertyInfo?.address || 'Sin ubicacion'
                  const rate = inv.interest_rate_investor || inv.loan?.interest_rate_ea || 0

                  const statusConfig: Record<string, { label: string; class: string }> = {
                    fundraising: { label: 'Fondeando', class: 'bg-amber-500/20 text-amber-400' },
                    active: { label: 'Al día', class: 'bg-emerald-500 text-white font-semibold' },
                    completed: { label: 'Completado', class: 'bg-blue-500/20 text-blue-400' },
                    defaulted: { label: 'En Mora', class: 'bg-red-500 text-white font-semibold' }
                  }

                  const status = statusConfig[loanStatus] || { label: loanStatus, class: 'bg-zinc-500/20 text-zinc-400' }

                  return (
                    <tr key={inv.id} className="border-b border-zinc-700/50 hover:bg-zinc-800/30">
                      <td className="py-4">
                        <span className="px-2 py-1 bg-zinc-800 text-teal-400 text-xs font-mono rounded">
                          {inv.loan?.code || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-zinc-500" />
                          <span className="text-white">{propertyDisplay}</span>
                        </div>
                      </td>
                      <td className="py-4 text-white font-medium">
                        ${Number(inv.amount_invested).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                      </td>
                      <td className="py-4 text-teal-400">
                        {rate.toFixed(1)}% E.A.
                      </td>
                      <td className="py-4">
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-500">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-teal-500'}`}
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded text-xs font-medium ${status.class}`}>
                          {status.label}
                        </span>
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
            <p>No se encontraron inversiones activas.</p>
            <p className="text-sm mt-2">Explora el marketplace para comenzar a invertir.</p>
          </div>
        )}
      </div>
    </div>
  )
}
