'use client'

interface BentoMetricsProps {
  commercialValue: number | null
  amountRequested: number | null
  ltv: string
  interestRateEa: number | null
}

export default function BentoMetrics({
  commercialValue,
  amountRequested,
  ltv,
  interestRateEa
}: BentoMetricsProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Parse LTV number for color coding
  const ltvNumber = parseFloat(ltv.replace('%', '')) || 0
  const getLtvStatus = () => {
    if (ltvNumber <= 40) return { label: 'Very Safe', color: 'text-emerald-400' }
    if (ltvNumber <= 55) return { label: 'Safe', color: 'text-teal-400' }
    if (ltvNumber <= 70) return { label: 'Moderate', color: 'text-amber-400' }
    return { label: 'High', color: 'text-red-400' }
  }

  const ltvStatus = getLtvStatus()

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Avalúo Comercial */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
        <p className="text-gray-600 text-xs uppercase tracking-wider mb-3">Avalúo Comercial</p>
        <p className="text-3xl font-bold text-white tracking-tight">
          {formatCurrency(commercialValue)}
        </p>
      </div>

      {/* Monto Solicitado */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
        <p className="text-gray-600 text-xs uppercase tracking-wider mb-3">Monto Solicitado</p>
        <p className="text-3xl font-bold text-white tracking-tight">
          {formatCurrency(amountRequested)}
        </p>
      </div>

      {/* LTV */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
        <p className="text-gray-600 text-xs uppercase tracking-wider mb-3">LTV (Loan to Value)</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-teal-400 tracking-tight">{ltv}</p>
          <span className={`text-sm ${ltvStatus.color}`}>{ltvStatus.label}</span>
        </div>
      </div>

      {/* Tasa E.A. */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
        <p className="text-gray-600 text-xs uppercase tracking-wider mb-3">Tasa (E.A.)</p>
        <p className="text-3xl font-bold text-white tracking-tight">
          {interestRateEa ? `${interestRateEa}%` : '-'}
        </p>
      </div>
    </div>
  )
}
