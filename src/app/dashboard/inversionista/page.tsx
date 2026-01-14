import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, Briefcase, Percent } from 'lucide-react'
import PortfolioChart from '../../../components/dashboard/PortfolioChart'

// 1. DEFINIMOS EL MOLDE DE LOS DATOS (Para calmar a TypeScript)
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
  } | null
}

export default async function InvestorDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login/inversionista')
  }

  // 2. HACEMOS LA CONSULTA
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
        start_date
      )
    `)
    .eq('investor_id', user.id)

  if (error) {
    console.error('Error:', error)
  }

  // 3. APLICAMOS EL MOLDE (CASTING)
  // Le decimos a TS: "Confía en mí, los datos tienen esta forma"
  const investments = (rawData || []) as unknown as Investment[]

  // 4. CALCULOS (Ahora TS sabe que las propiedades existen)
  const totalInvested = investments.reduce((sum, item) => sum + Number(item.amount_invested), 0)
  
  // Verificamos que 'loans' exista antes de leer el status
  const activeProjects = investments.filter(i => i.loans?.status === 'active').length
  
  const weightedRoi = totalInvested > 0 
    ? investments.reduce((acc, item) => acc + (Number(item.amount_invested) * Number(item.roi_percentage)), 0) / totalInvested
    : 0

  const totalExpectedReturn = investments.reduce((acc, item) => {
    return acc + (Number(item.amount_invested) * (1 + Number(item.roi_percentage) / 100))
  }, 0)
  
  const simulatedCollected = totalExpectedReturn * 0.15 

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-emerald-400">Panel de Inversionista</h1>
        <p className="text-slate-400 mt-1">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
              <TrendingUp size={24} />
            </div>
            <span className="text-slate-400 text-sm">Total Invertido</span>
          </div>
          <p className="text-3xl font-bold text-white">
            ${totalInvested.toLocaleString('es-CO')}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
              <Briefcase size={24} />
            </div>
            <span className="text-slate-400 text-sm">Proyectos Activos</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeProjects}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
              <Percent size={24} />
            </div>
            <span className="text-slate-400 text-sm">ROI Promedio</span>
          </div>
          <p className="text-3xl font-bold text-white">{weightedRoi.toFixed(2)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-6">Composición</h2>
          <div className="h-64">
             <PortfolioChart invested={totalInvested} collected={simulatedCollected} />
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6">Inversiones Activas</h2>
          
          {investments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-slate-700">
                    <th className="pb-4 font-medium">Crédito</th>
                    <th className="pb-4 font-medium">Participación</th>
                    <th className="pb-4 font-medium">Monto</th>
                    <th className="pb-4 font-medium">Tasa (ROI)</th>
                    <th className="pb-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {investments.map((inv) => {
                     const loanTotal = inv.loans?.total_amount || 1;
                     const participation = (Number(inv.amount_invested) / Number(loanTotal)) * 100;
                     
                     return (
                      <tr key={inv.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-4 font-mono text-emerald-400 font-bold">
                          {inv.loans?.code || 'N/A'}
                        </td>
                        <td className="py-4 text-slate-300">
                          {participation.toFixed(1)}%
                        </td>
                        <td className="py-4 font-medium text-white">
                          ${Number(inv.amount_invested).toLocaleString('es-CO')}
                        </td>
                        <td className="py-4 text-emerald-400">
                          {inv.roi_percentage}% E.A.
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                            {inv.loans?.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Briefcase size={48} className="mb-4 opacity-50" />
              <p>No se encontraron inversiones.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}