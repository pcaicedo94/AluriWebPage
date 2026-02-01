import { getActiveLoans, MarketplaceLoan } from './actions'
import { Store, MapPin, Calendar, Percent, Building } from 'lucide-react'
import Link from 'next/link'

export default async function MarketplacePage() {
  const { data: loans, error } = await getActiveLoans()

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '$0'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPropertyTitle = (loan: MarketplaceLoan) => {
    const propertyType = loan.property_info?.property_type || 'Inmueble'
    const city = loan.property_info?.city || 'Colombia'
    return `${propertyType} en ${city}`
  }

  const getFundingProgress = (loan: MarketplaceLoan) => {
    const requested = loan.amount_requested || 0
    const funded = loan.amount_funded || 0
    if (requested === 0) return 0
    return Math.min((funded / requested) * 100, 100)
  }

  return (
    <div className="text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Marketplace</h1>
        <p className="text-slate-400 mt-1">
          Explora oportunidades de inversion con garantia inmobiliaria
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">Error al cargar las oportunidades: {error}</p>
        </div>
      )}

      {loans.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => {
            const progress = getFundingProgress(loan)

            return (
              <div
                key={loan.id}
                className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Property Image Placeholder */}
                <div className="relative h-48 bg-slate-700">
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                    <Building size={64} className="text-slate-600" />
                  </div>
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-primary/90 text-slate-900 text-xs font-bold rounded-full">
                      {loan.code}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {getPropertyTitle(loan)}
                  </h3>

                  {loan.property_info?.address && (
                    <p className="text-slate-400 text-sm flex items-center gap-1 mb-4">
                      <MapPin size={14} />
                      {loan.property_info.address}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Financiado</span>
                      <span className="text-primary font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{formatCurrency(loan.amount_funded || 0)}</span>
                      <span>{formatCurrency(loan.amount_requested)}</span>
                    </div>
                  </div>

                  {/* Key Data */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Percent size={12} />
                        Rentabilidad EA
                      </div>
                      <p className="text-primary font-bold text-lg">
                        {loan.interest_rate_ea ? `${loan.interest_rate_ea}%` : '-'}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Calendar size={12} />
                        Plazo
                      </div>
                      <p className="text-white font-bold text-lg">
                        {loan.term_months ? `${loan.term_months} meses` : '-'}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/dashboard/inversionista/marketplace/${loan.id}`}
                    className="block w-full py-3 bg-primary hover:bg-primary-dark text-slate-900 text-center font-semibold rounded-xl transition-colors"
                  >
                    Ver Oportunidad
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-800 rounded-2xl border border-slate-700">
          <Store size={48} className="text-slate-500 mb-4" />
          <p className="text-slate-400 text-lg font-medium">No hay oportunidades disponibles</p>
          <p className="text-slate-500 text-sm mt-1">Vuelve pronto para ver nuevas inversiones</p>
        </div>
      )}
    </div>
  )
}
