import { createClient } from '../../../../utils/supabase/server'
import { Briefcase } from 'lucide-react'
import Link from 'next/link'
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
  amount_collected: number | null
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
      amount_collected,
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

  // Total collected from actual database values
  const recaudadoTotal = investments.reduce((acc, inv) => {
    return acc + Number(inv.amount_collected || 0)
  }, 0)

  // Capital vigente = Total invertido - Recaudado
  const capitalVigente = montoInvertidoTotal - recaudadoTotal

  return (
    <div className="text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Mis Inversiones</h1>
        <p className="text-zinc-500 mt-1">
          Estado de cuenta detallado
        </p>
      </header>

      {/* Top Section: KPIs + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* KPI Summary Card */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
          <h2 className="text-xl font-semibold mb-6 text-white">Resumen de Inversiones</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Cantidad de Inversiones</span>
              <span className="text-2xl font-bold text-white">{cantidadInversiones}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Monto Invertido Total</span>
              <span className="text-2xl font-bold text-white">{formatCOP(montoInvertidoTotal)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Rentabilidad Promedio</span>
              <span className="text-2xl font-bold text-primary">{rentabilidadPromedio.toFixed(2)}% E.A.</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Capital Invertido Vigente</span>
              <span className="text-2xl font-bold text-white">{formatCOP(capitalVigente)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-zinc-500">Recaudado Total</span>
              <span className="text-2xl font-bold text-emerald-400">{formatCOP(recaudadoTotal)}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
          <h2 className="text-xl font-semibold mb-6 text-white">Composicion del Portafolio</h2>
          <div className="h-72">
            <PortfolioChart invested={montoInvertidoTotal} collected={recaudadoTotal} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Investment Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-6 text-white">Detalle de Inversiones</h2>

        {investments.length > 0 ? (
          <div className="space-y-4">
            {investments.map((inv) => {
              const loan = inv.loans
              const amountOverdue = Number(loan?.amount_overdue || 0)
              const isOverdue = amountOverdue > 0

              // Actual collected amount from database
              const investedAmount = Number(inv.amount_invested)
              const collectedForInv = Number(inv.amount_collected || 0)

              // Progress percentage (collected / invested amount)
              const progressPercent = investedAmount > 0
                ? Math.min((collectedForInv / investedAmount) * 100, 100)
                : 0

              return (
                <Link
                  key={inv.id}
                  href={`/dashboard/inversionista/mis-inversiones/${loan?.code || inv.id}`}
                  className="block bg-zinc-900 p-6 rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Credito #{loan?.code || 'N/A'}
                      </h3>
                      <p className="text-zinc-400 text-sm mt-1">
                        Tu inversion: <span className="text-white font-medium">{formatCOP(investedAmount)}</span>
                      </p>
                      <p className={`text-sm mt-1 ${isOverdue ? 'text-orange-400' : 'text-primary'}`}>
                        Recibido a la fecha: <span className="font-medium">{formatCOP(collectedForInv)}</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        isOverdue
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-primary/20 text-primary border border-primary/30'
                      }`}
                    >
                      {isOverdue ? 'En mora' : 'Al día'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverdue ? 'bg-orange-500' : 'bg-primary'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-zinc-400 text-sm min-w-[55px] text-right">
                      {progressPercent.toFixed(2)}%
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-zinc-900 rounded-xl border border-zinc-700">
            <Briefcase size={48} className="mb-4 opacity-50" />
            <p>No se encontraron inversiones.</p>
          </div>
        )}
      </div>
    </div>
  )
}
