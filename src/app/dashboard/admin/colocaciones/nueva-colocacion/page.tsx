import { getInvestorsForSelect, getNextLoanCode } from '../actions'
import UniversalCreditForm from '../UniversalCreditForm'
import { FileSpreadsheet, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NuevaColocacionPage() {
  const [investorsResult, nextCode] = await Promise.all([
    getInvestorsForSelect(),
    getNextLoanCode()
  ])

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header>
        <Link
          href="/dashboard/admin/colocaciones"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span>Volver a Colocaciones</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-xl">
            <FileSpreadsheet size={24} className="text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Nueva Colocacion</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Crea creditos completos con deudor e inversionistas en un solo formulario
            </p>
          </div>
        </div>
      </header>

      {/* Form Section */}
      <UniversalCreditForm
        investors={investorsResult.data}
        nextCode={nextCode}
      />
    </div>
  )
}
