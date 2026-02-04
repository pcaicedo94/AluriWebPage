import { createClient } from '../../../../utils/supabase/server'
import { Briefcase } from 'lucide-react'
import Link from 'next/link'
import PortfolioChart from '../../../../components/dashboard/PortfolioChart'
import InvestmentsTabs from './InvestmentsTabs'

// Property info from JSON column
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

// Updated interface with correct column names
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

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch ALL investments with loan payments for real progress tracking
  const { data: rawData, error } = await supabase
    .from('investments')
    .select(`
      *,
      loan:loans!inner (
        *,
        loan_payments (
          amount_capital,
          amount_interest
        )
      )
    `)
    .eq('investor_id', user?.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching investments:', JSON.stringify(error, null, 2))
  }

  const investments = (rawData || []) as unknown as Investment[]

  // Filter for KPI calculations (active + defaulted loan status)
  const activeInvestments = investments.filter(inv =>
    inv.loan?.status === 'active' || inv.loan?.status === 'defaulted'
  )

  // KPI Calculations
  const cantidadInversiones = investments.length
  const cantidadActivas = activeInvestments.length
  const montoInvertidoTotal = investments.reduce((sum, inv) => sum + Number(inv.amount_invested || 0), 0)

  // Calculate weighted average rate using interest_rate_investor or loan's interest_rate_ea
  const rentabilidadPromedio = montoInvertidoTotal > 0
    ? investments.reduce((acc, inv) => {
        const rate = inv.interest_rate_investor || inv.loan?.interest_rate_ea || 0
        return acc + (Number(inv.amount_invested) * Number(rate))
      }, 0) / montoInvertidoTotal
    : 0

  // Calculate REAL collected amounts based on loan_payments (pro-rated by participation)
  let totalCapitalRecuperado = 0
  let totalInteresesGanados = 0

  investments.forEach(inv => {
    const loan = inv.loan
    if (!loan || !loan.loan_payments) return

    const amountRequested = loan.amount_requested || 0
    const amountInvested = inv.amount_invested || 0

    // Calculate investor's share (participation percentage)
    const share = amountRequested > 0 ? amountInvested / amountRequested : 0

    // Sum all payments for this loan
    const totalLoanCapital = loan.loan_payments.reduce((sum, p) => sum + (p.amount_capital || 0), 0)
    const totalLoanInterest = loan.loan_payments.reduce((sum, p) => sum + (p.amount_interest || 0), 0)

    // Pro-rate by investor's share
    totalCapitalRecuperado += totalLoanCapital * share
    totalInteresesGanados += totalLoanInterest * share
  })

  const recaudadoTotal = totalCapitalRecuperado + totalInteresesGanados

  // Capital vigente = Total invertido - Capital recuperado
  const capitalVigente = montoInvertidoTotal - totalCapitalRecuperado

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
              <span className="text-zinc-500">Total de Inversiones</span>
              <span className="text-2xl font-bold text-white">{cantidadInversiones}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Inversiones Activas</span>
              <span className="text-2xl font-bold text-teal-400">{cantidadActivas}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Monto Invertido Total</span>
              <span className="text-2xl font-bold text-white">{formatCOP(montoInvertidoTotal)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Rentabilidad Promedio</span>
              <span className="text-2xl font-bold text-teal-400">{rentabilidadPromedio.toFixed(2)}% E.A.</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Capital Invertido Vigente</span>
              <span className="text-2xl font-bold text-white">{formatCOP(capitalVigente)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Capital Recuperado</span>
              <span className="text-2xl font-bold text-blue-400">{formatCOP(totalCapitalRecuperado)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-700">
              <span className="text-zinc-500">Intereses Ganados</span>
              <span className="text-2xl font-bold text-amber-400">{formatCOP(totalInteresesGanados)}</span>
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

      {/* Bottom Section: Investment Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-6 text-white">Detalle de Inversiones</h2>

        {investments.length > 0 ? (
          <InvestmentsTabs investments={investments} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-zinc-900 rounded-xl border border-zinc-700">
            <Briefcase size={48} className="mb-4 opacity-50" />
            <p>No se encontraron inversiones.</p>
            <Link
              href="/dashboard/inversionista/marketplace"
              className="mt-4 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Explorar Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
