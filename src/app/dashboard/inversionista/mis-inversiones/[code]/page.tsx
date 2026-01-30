import { createClient } from '../../../../../utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, FileText, CheckCircle, AlertCircle, Receipt } from 'lucide-react'

// Generic property images for display
const propertyImages = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
]

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

// Helper: Format date
function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function InvestmentDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch all investments for this user with their loans
  const { data: allInvestments, error } = await supabase
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
    .eq('investor_id', user.id)

  if (error) {
    console.error('Error fetching investments:', error.message)
    notFound()
  }

  // Find the investment with the matching loan code
  const rawData = (allInvestments as unknown as Investment[])?.find(
    inv => inv.loans?.code === code
  )

  if (!rawData) {
    notFound()
  }

  const investment = rawData as unknown as Investment
  const loan = investment.loans
  const amountOverdue = Number(loan?.amount_overdue || 0)
  const isOverdue = amountOverdue > 0

  // Calculate values
  const investedAmount = Number(investment.amount_invested)
  const roi = Number(investment.roi_percentage)
  const expectedReturn = investedAmount * (roi / 100)
  const collectedAmount = Number(investment.amount_collected || 0)

  // Simulated payment history
  const paymentHistory = [
    { date: '15 de Mayo, 2024', type: 'Pago mensual', amount: 2150000 },
    { date: '15 de Abril, 2024', type: 'Pago mensual', amount: 2150000 },
    { date: '15 de Marzo, 2024', type: 'Pago mensual', amount: 2150000 },
  ]

  return (
    <div className="text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/inversionista/mis-inversiones"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Detalle de Hipoteca</span>
        </Link>

        <p className="text-primary text-sm">Resumen de Hipoteca</p>
        <h1 className="text-2xl font-bold text-white mt-1">
          Hipoteca ID: {loan?.code || 'N/A'}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Credito respaldado por hipoteca
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={propertyImages[0]}
                alt="Propiedad"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-lg text-white text-sm">
                1/5
              </div>
            </div>
            <div className="p-4 flex gap-2">
              {propertyImages.slice(1).map((img, i) => (
                <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={img}
                    alt={`Propiedad ${i + 2}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Investment Performance */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Rendimiento de la Inversion</h2>
              <span className="text-zinc-500 text-sm">Historico</span>
            </div>

            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Rentabilidad Total (TIR)</p>
            <p className="text-3xl font-bold text-primary mb-6">{roi}%</p>

            {/* Chart Placeholder */}
            <div className="h-40 bg-zinc-800/50 rounded-lg flex items-center justify-center mb-6">
              <span className="text-zinc-500">Grafico de rendimiento</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-zinc-500 text-xs">Inversion</p>
                <p className="text-zinc-400 text-xs">Intereses Ganados</p>
                <p className="text-primary font-semibold">{formatCOP(collectedAmount)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Del</p>
                <p className="text-zinc-400 text-xs">Capital Recuperado</p>
                <p className="text-primary font-semibold">{formatCOP(expectedReturn)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Al</p>
                <p className="text-zinc-400 text-xs">Retorno Esperado</p>
                <p className="text-zinc-400 font-semibold">-</p>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4">Estado de Cobranza</h2>
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              isOverdue ? 'bg-orange-500/10' : 'bg-primary/10'
            }`}>
              {isOverdue ? (
                <AlertCircle className="text-orange-400" size={24} />
              ) : (
                <CheckCircle className="text-primary" size={24} />
              )}
              <span className={isOverdue ? 'text-orange-400' : 'text-primary'}>
                {isOverdue ? 'En mora' : 'Al corriente'}
              </span>
            </div>
          </div>

          {/* Next Payment */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4">Proximo Pago</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-xs">Fecha de vencimiento</p>
                <p className="text-white font-medium">{formatDate(loan?.next_payment_date || null)}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs">Monto</p>
                <p className="text-primary font-semibold text-lg">
                  {loan?.next_payment_amount ? formatCOP(Number(loan.next_payment_amount)) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4">Historial de Pagos</h2>
            <div className="space-y-4">
              {paymentHistory.map((payment, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      <Receipt size={16} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">{payment.date}</p>
                      <p className="text-zinc-500 text-xs">{payment.type}</p>
                    </div>
                  </div>
                  <p className="text-white font-medium">{formatCOP(payment.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
            <h3 className="text-sm font-semibold text-white mb-1">Ubicacion</h3>
            <p className="text-zinc-500 text-xs mb-4">Colombia</p>

            {/* Map Placeholder */}
            <div className="h-40 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="text-primary" size={32} />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
            <p className="text-zinc-500 text-sm mb-4">Soporte sobre esta inversion</p>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-primary text-black font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors">
                <Phone size={18} />
                Contactar a Aluri
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white font-medium py-3 px-4 rounded-lg hover:bg-zinc-700 transition-colors">
                <FileText size={18} />
                Ver Documentos
              </button>
            </div>
          </div>

          {/* Investment Summary */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700">
            <h3 className="text-sm font-semibold text-white mb-4">Resumen de Inversion</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500 text-sm">Monto invertido</span>
                <span className="text-white font-medium">{formatCOP(investedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-sm">Tasa de interes</span>
                <span className="text-white font-medium">{roi}% E.A.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-sm">Plazo</span>
                <span className="text-white font-medium">{loan?.term_months || 'N/A'} meses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-sm">Fecha inicio</span>
                <span className="text-white font-medium">{formatDate(loan?.start_date || null)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
