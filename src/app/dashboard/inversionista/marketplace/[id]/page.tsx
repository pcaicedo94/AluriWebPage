import { getLoanDetail } from './actions'
import { ArrowLeft, Building, MapPin, Calendar, Percent, Clock, User, Shield, FileText } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import InvestmentPanel from './InvestmentPanel'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params

  const { data: loan, error } = await getLoanDetail(id)

  if (error || !loan) {
    notFound()
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPropertyTitle = () => {
    const propertyType = loan.property_info?.property_type || 'Inmueble'
    const city = loan.property_info?.city || 'Colombia'
    return `${propertyType} en ${city}`
  }

  // Anonymize owner name (show only first name)
  const getOwnerDisplayName = () => {
    if (!loan.owner?.full_name) return 'Deudor Verificado'
    const firstName = loan.owner.full_name.split(' ')[0]
    return firstName
  }

  // Calculate LTV if we have the data
  const calculateLTV = () => {
    const commercialValue = loan.property_info?.commercial_value
    const amountRequested = loan.amount_requested
    if (!commercialValue || !amountRequested) return null
    return ((amountRequested / commercialValue) * 100).toFixed(1)
  }

  const ltv = calculateLTV()

  return (
    <div className="text-white p-8">
      {/* Back Link */}
      <Link
        href="/dashboard/inversionista/marketplace"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Volver al Marketplace</span>
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-primary/90 text-slate-900 text-sm font-bold rounded-full">
            {loan.code}
          </span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full border border-blue-500/30">
            En Recaudo
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white">{getPropertyTitle()}</h1>
        {loan.property_info?.address && (
          <p className="text-slate-400 flex items-center gap-2 mt-2">
            <MapPin size={16} />
            {loan.property_info.address}, {loan.property_info.city}
          </p>
        )}
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Property & Loan Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Image Placeholder */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="h-72 bg-slate-700 flex items-center justify-center">
              <div className="text-center">
                <Building size={80} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Imagen del inmueble</p>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building size={20} className="text-primary" />
              Información del Inmueble
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-slate-500 text-sm">Tipo de Propiedad</span>
                <p className="text-white font-medium">
                  {loan.property_info?.property_type || 'No especificado'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Ubicación</span>
                <p className="text-white font-medium">
                  {loan.property_info?.city || 'No especificado'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Valor Comercial</span>
                <p className="text-white font-medium">
                  {formatCurrency(loan.property_info?.commercial_value || null)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-sm">Matrícula Inmobiliaria</span>
                <p className="text-white font-medium">
                  {loan.property_info?.registration_number || 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Conditions */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Percent size={20} className="text-primary" />
              Condiciones Financieras
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Percent size={14} />
                  Rentabilidad EA
                </div>
                <p className="text-primary font-bold text-2xl">
                  {loan.interest_rate_ea ? `${loan.interest_rate_ea}%` : '-'}
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Clock size={14} />
                  Tasa Nominal Mensual
                </div>
                <p className="text-white font-bold text-2xl">
                  {loan.interest_rate_nm ? `${loan.interest_rate_nm}%` : '-'}
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Calendar size={14} />
                  Plazo
                </div>
                <p className="text-white font-bold text-2xl">
                  {loan.term_months ? `${loan.term_months} meses` : '-'}
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <FileText size={14} />
                  Tipo de Pago
                </div>
                <p className="text-white font-bold text-lg">
                  {loan.payment_type === 'interest_only' ? 'Solo Intereses' :
                   loan.payment_type === 'principal_and_interest' ? 'Capital + Intereses' : '-'}
                </p>
              </div>
            </div>

            {/* LTV Section */}
            {ltv && (
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={20} className="text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Loan-to-Value (LTV)</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xl">{ltv}%</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  El préstamo representa el {ltv}% del valor comercial del inmueble,
                  proporcionando un margen de seguridad para los inversionistas.
                </p>
              </div>
            )}
          </div>

          {/* Borrower Info (Anonymized) */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Información del Deudor
            </h2>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                <User size={32} className="text-slate-500" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{getOwnerDisplayName()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                    Verificado
                  </span>
                  <span className="text-slate-500 text-sm">Deudor con garantía inmobiliaria</span>
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm mt-4">
              La identidad completa del deudor y los documentos de garantía están verificados
              por Aluri y serán compartidos a los inversionistas una vez se complete el fondeo.
            </p>
          </div>

          {/* Timeline */}
          {loan.workflow_dates?.estimated_date && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                Fechas Importantes
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Fecha Límite de Recaudo</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(loan.workflow_dates.estimated_date).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Investment Panel (Sticky) */}
        <div className="lg:col-span-1">
          <InvestmentPanel
            loanId={loan.id}
            amountRequested={loan.amount_requested || 0}
            amountFunded={loan.amount_funded || 0}
            interestRateEa={loan.interest_rate_ea}
            termMonths={loan.term_months}
          />
        </div>
      </div>
    </div>
  )
}
