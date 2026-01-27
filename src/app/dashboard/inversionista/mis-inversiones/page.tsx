import { createClient } from '../../../../utils/supabase/server'
import { Briefcase } from 'lucide-react'
import PortfolioChart from '../../../../components/dashboard/PortfolioChart'

// Strictly typed interface with updated loan schema
interface Loan {
  code: string
  status: string
  interest_rate: number
  total_amount: number
  start_date: string
  term_months: number
  amortization_type: string | null
  next_payment_date: string | null
  next_payment_amount: number | null
  amount_overdue: number | null
}

interface Investment {
  id: string
  amount_invested: number
  roi_percentage: number
  created_at: string
  loan_id: string
  loans: Loan | null
}

// Helper: Format currency as COP
function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Helper: Format date as dd/MM/yyyy
function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Helper: Calculate maturity date (start_date + term_months)
function calculateMaturityDate(startDate: string | null, termMonths: number | null): string {
  if (!startDate || !termMonths) return 'N/A'
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + termMonths)
  return formatDate(date.toISOString())
}

export default async function MisInversionesPage() {
  const supabase = await createClient()

  // User is already verified in layout.tsx
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch investments with updated loan columns
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
        term_months,
        amortization_type,
        next_payment_date,
        next_payment_amount,
        amount_overdue
      )
    `)
    .eq('investor_id', user?.id)

  if (error) {
    console.error('Error fetching investments:', JSON.stringify(error, null, 2))
  }

  const investments = (rawData || []) as unknown as Investment[]

  // KPI Calculations
  const cantidadInversiones = investments.length
  const montoInvertidoTotal = investments.reduce((sum, inv) => sum + Number(inv.amount_invested), 0)

  const rentabilidadPromedio = montoInvertidoTotal > 0
    ? investments.reduce((acc, inv) => acc + (Number(inv.amount_invested) * Number(inv.roi_percentage)), 0) / montoInvertidoTotal
    : 0

  // Simulated collected (20% of expected returns for now)
  const recaudadoTotal = investments.reduce((acc, inv) => {
    const invested = Number(inv.amount_invested)
    const roi = Number(inv.roi_percentage) / 100
    return acc + (invested * roi * 0.20)
  }, 0)

  // Capital vigente = Total invertido - Recaudado
  const capitalVigente = montoInvertidoTotal - recaudadoTotal

  return (
    <div className="text-white p-8">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-primary">Mis Inversiones</h1>
        <p className="text-slate-400 mt-1">
          Estado de cuenta detallado
        </p>
      </header>

      {/* Top Section: KPIs + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* KPI Summary Card */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-6 text-primary">Resumen de Inversiones</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-700">
              <span className="text-slate-400">Cantidad de Inversiones</span>
              <span className="text-2xl font-bold text-white">{cantidadInversiones}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-700">
              <span className="text-slate-400">Monto Invertido Total</span>
              <span className="text-2xl font-bold text-white">{formatCOP(montoInvertidoTotal)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-700">
              <span className="text-slate-400">Rentabilidad Promedio</span>
              <span className="text-2xl font-bold text-primary">{rentabilidadPromedio.toFixed(2)}% E.A.</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-700">
              <span className="text-slate-400">Capital Invertido Vigente</span>
              <span className="text-2xl font-bold text-white">{formatCOP(capitalVigente)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400">Recaudado Total</span>
              <span className="text-2xl font-bold text-emerald-400">{formatCOP(recaudadoTotal)}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-6">Composicion del Portafolio</h2>
          <div className="h-72">
            <PortfolioChart invested={montoInvertidoTotal} collected={recaudadoTotal} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Detailed Table */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-6">Detalle de Inversiones</h2>

        {investments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-700 uppercase tracking-wider">
                  <th className="pb-4 px-2 font-medium">Credito</th>
                  <th className="pb-4 px-2 font-medium">Participacion %</th>
                  <th className="pb-4 px-2 font-medium">Monto Invertido</th>
                  <th className="pb-4 px-2 font-medium">Fecha Originacion</th>
                  <th className="pb-4 px-2 font-medium">Tipo Credito</th>
                  <th className="pb-4 px-2 font-medium">Rentabilidad</th>
                  <th className="pb-4 px-2 font-medium">Recaudado</th>
                  <th className="pb-4 px-2 font-medium">En Mora?</th>
                  <th className="pb-4 px-2 font-medium">Para estar al dia</th>
                  <th className="pb-4 px-2 font-medium">Cancelacion Total</th>
                  <th className="pb-4 px-2 font-medium">Fecha Prox. Cuota</th>
                  <th className="pb-4 px-2 font-medium">Proxima Cuota</th>
                  <th className="pb-4 px-2 font-medium">Fecha Vencimiento</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {investments.map((inv) => {
                  const loan = inv.loans
                  const loanTotal = loan?.total_amount || 1
                  const participation = (Number(inv.amount_invested) / Number(loanTotal)) * 100
                  const amountOverdue = Number(loan?.amount_overdue || 0)
                  const isOverdue = amountOverdue > 0

                  // Simulated collected for this investment (20% of expected return)
                  const investedAmount = Number(inv.amount_invested)
                  const roi = Number(inv.roi_percentage) / 100
                  const collectedForInv = investedAmount * roi * 0.20

                  // Current loan balance (simplified: invested - collected)
                  const currentBalance = investedAmount - collectedForInv

                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30"
                    >
                      {/* Credito */}
                      <td className="py-4 px-2 font-mono text-primary font-bold">
                        {loan?.code || 'N/A'}
                      </td>

                      {/* Participacion % */}
                      <td className="py-4 px-2 text-slate-300">
                        {participation.toFixed(2)}%
                      </td>

                      {/* Monto Invertido Inicial */}
                      <td className="py-4 px-2 font-medium text-white">
                        {formatCOP(investedAmount)}
                      </td>

                      {/* Fecha Originacion */}
                      <td className="py-4 px-2 text-slate-300">
                        {formatDate(loan?.start_date || null)}
                      </td>

                      {/* Tipo Credito */}
                      <td className="py-4 px-2 text-slate-300 capitalize">
                        {loan?.amortization_type || 'N/A'}
                      </td>

                      {/* Rentabilidad Esperada */}
                      <td className="py-4 px-2 text-primary font-medium">
                        {inv.roi_percentage}% E.A.
                      </td>

                      {/* Recaudado */}
                      <td className="py-4 px-2 text-emerald-400">
                        {formatCOP(collectedForInv)}
                      </td>

                      {/* En Mora? */}
                      <td className="py-4 px-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isOverdue
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isOverdue ? 'Si' : 'No'}
                        </span>
                      </td>

                      {/* Necesario para estar al dia */}
                      <td className={`py-4 px-2 ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-300'}`}>
                        {isOverdue ? formatCOP(amountOverdue) : '-'}
                      </td>

                      {/* Cancelacion total (Current Balance) */}
                      <td className="py-4 px-2 text-white font-medium">
                        {formatCOP(currentBalance)}
                      </td>

                      {/* Fecha proxima cuota */}
                      <td className="py-4 px-2 text-slate-300">
                        {formatDate(loan?.next_payment_date || null)}
                      </td>

                      {/* Proxima cuota */}
                      <td className="py-4 px-2 text-white">
                        {loan?.next_payment_amount ? formatCOP(Number(loan.next_payment_amount)) : 'N/A'}
                      </td>

                      {/* Fecha vencimiento (start_date + term_months) */}
                      <td className="py-4 px-2 text-slate-300">
                        {calculateMaturityDate(loan?.start_date || null, loan?.term_months || null)}
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
  )
}
