import { getInvestorsForSelect, getAllLoansWithDetails, getNextLoanCode } from './actions'
import UniversalCreditForm from './UniversalCreditForm'
import LoansTable from './LoansTable'
import { FileSpreadsheet } from 'lucide-react'

export default async function ColocacionesPage() {
  const [investorsResult, loansResult, nextCode] = await Promise.all([
    getInvestorsForSelect(),
    getAllLoansWithDetails(),
    getNextLoanCode()
  ])

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-xl">
            <FileSpreadsheet size={24} className="text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Registrador Universal de Creditos</h1>
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

      {/* Table Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Creditos Registrados</h2>
          <span className="text-sm text-slate-500">{loansResult.data.length} registros</span>
        </div>
        <LoansTable loans={loansResult.data} investors={investorsResult.data} />
      </section>
    </div>
  )
}
