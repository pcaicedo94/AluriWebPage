'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ChevronDown,
  CreditCard,
  User,
  DollarSign,
  Calendar,
  Percent,
  Check,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react'
import {
  LoanOption,
  InvestorOption,
  getLoansForCombobox,
  getInvestorsForCombobox,
  registerManualInvestment
} from './actions'

export default function ManualInvestmentForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Data states
  const [loans, setLoans] = useState<LoanOption[]>([])
  const [investors, setInvestors] = useState<InvestorOption[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Selection states
  const [selectedLoan, setSelectedLoan] = useState<LoanOption | null>(null)
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorOption | null>(null)

  // Form states
  const [amount, setAmount] = useState<string>('')
  const [investmentDate, setInvestmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [customRate, setCustomRate] = useState<string>('')
  const [useCustomRate, setUseCustomRate] = useState(false)

  // UI states
  const [loanSearchOpen, setLoanSearchOpen] = useState(false)
  const [investorSearchOpen, setInvestorSearchOpen] = useState(false)
  const [loanSearch, setLoanSearch] = useState('')
  const [investorSearch, setInvestorSearch] = useState('')

  // Feedback states
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setLoadingData(true)
      const [loansResult, investorsResult] = await Promise.all([
        getLoansForCombobox(),
        getInvestorsForCombobox()
      ])

      if (!loansResult.error) setLoans(loansResult.data)
      if (!investorsResult.error) setInvestors(investorsResult.data)
      setLoadingData(false)
    }
    loadData()
  }, [])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Filter functions
  const filteredLoans = loans.filter(loan => {
    const searchLower = loanSearch.toLowerCase()
    return (
      loan.code.toLowerCase().includes(searchLower) ||
      (loan.deudor?.toLowerCase().includes(searchLower) ?? false)
    )
  })

  const filteredInvestors = investors.filter(investor => {
    const searchLower = investorSearch.toLowerCase()
    return (
      (investor.full_name?.toLowerCase().includes(searchLower) ?? false) ||
      (investor.document_id?.toLowerCase().includes(searchLower) ?? false) ||
      (investor.email?.toLowerCase().includes(searchLower) ?? false)
    )
  })

  const handleSubmit = async () => {
    if (!selectedLoan || !selectedInvestor || !amount || !investmentDate) {
      showToast('error', 'Por favor complete todos los campos obligatorios.')
      return
    }

    const amountNum = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('error', 'Por favor ingrese un monto válido.')
      return
    }

    startTransition(async () => {
      const result = await registerManualInvestment({
        loan_id: selectedLoan.id,
        investor_id: selectedInvestor.id,
        amount: amountNum,
        investment_date: investmentDate,
        custom_rate: useCustomRate ? parseFloat(customRate) : null
      })

      if (result.success) {
        showToast('success', 'Inversión registrada exitosamente')
        // Reset form
        setSelectedLoan(null)
        setSelectedInvestor(null)
        setAmount('')
        setInvestmentDate(new Date().toISOString().split('T')[0])
        setCustomRate('')
        setUseCustomRate(false)
        router.refresh()
      } else {
        showToast('error', result.error || 'Error al registrar la inversión')
      }
    })
  }

  const resetForm = () => {
    setSelectedLoan(null)
    setSelectedInvestor(null)
    setAmount('')
    setInvestmentDate(new Date().toISOString().split('T')[0])
    setCustomRate('')
    setUseCustomRate(false)
  }

  if (loadingData) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-teal-400" />
          <span className="text-slate-400">Cargando datos...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {/* Form Header */}
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Nueva Colocación Manual</h2>
          <p className="text-sm text-slate-500 mt-1">
            Registra inversiones realizadas fuera de la plataforma
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Section A: Credit Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <CreditCard size={18} className="text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                A. Selección de Crédito
              </h3>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setLoanSearchOpen(!loanSearchOpen)
                  setInvestorSearchOpen(false)
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-slate-600 transition-colors"
              >
                {selectedLoan ? (
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-slate-700 text-teal-400 text-xs font-mono rounded">
                      {selectedLoan.code}
                    </span>
                    <span className="text-white">{selectedLoan.deudor || 'Sin deudor'}</span>
                    <span className="text-slate-500 text-sm">
                      (Disponible: {formatCurrency(selectedLoan.remaining)})
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-500">Seleccionar crédito...</span>
                )}
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${
                    loanSearchOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Loan Dropdown */}
              {loanSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 max-h-72 overflow-hidden">
                  <div className="p-2 border-b border-slate-700">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="text"
                        value={loanSearch}
                        onChange={e => setLoanSearch(e.target.value)}
                        placeholder="Buscar por código o deudor..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-56">
                    {filteredLoans.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">
                        No se encontraron créditos
                      </div>
                    ) : (
                      filteredLoans.map(loan => (
                        <button
                          key={loan.id}
                          type="button"
                          onClick={() => {
                            setSelectedLoan(loan)
                            setLoanSearchOpen(false)
                            setLoanSearch('')
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-slate-700 text-teal-400 text-xs font-mono rounded">
                              {loan.code}
                            </span>
                            <span className="text-white text-sm">
                              {loan.deudor || 'Sin deudor'}
                            </span>
                          </div>
                          <span className="text-slate-400 text-xs">
                            Disponible: {formatCurrency(loan.remaining)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedLoan && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-500">Monto Solicitado</p>
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(selectedLoan.amount_requested || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Monto Recaudado</p>
                  <p className="text-sm font-medium text-teal-400">
                    {formatCurrency(selectedLoan.amount_funded || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cupo Disponible</p>
                  <p className="text-sm font-medium text-amber-400">
                    {formatCurrency(selectedLoan.remaining)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section B: Investor Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <User size={18} className="text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                B. Selección de Inversionista
              </h3>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setInvestorSearchOpen(!investorSearchOpen)
                  setLoanSearchOpen(false)
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-slate-600 transition-colors"
              >
                {selectedInvestor ? (
                  <div className="flex items-center gap-3">
                    <span className="text-white">{selectedInvestor.full_name || 'Sin nombre'}</span>
                    <span className="text-slate-500 text-sm font-mono">
                      CC: {selectedInvestor.document_id || '-'}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-500">Seleccionar inversionista...</span>
                )}
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${
                    investorSearchOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Investor Dropdown */}
              {investorSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 max-h-72 overflow-hidden">
                  <div className="p-2 border-b border-slate-700">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="text"
                        value={investorSearch}
                        onChange={e => setInvestorSearch(e.target.value)}
                        placeholder="Buscar por nombre, cédula o email..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-56">
                    {filteredInvestors.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">
                        No se encontraron inversionistas
                      </div>
                    ) : (
                      filteredInvestors.map(investor => (
                        <button
                          key={investor.id}
                          type="button"
                          onClick={() => {
                            setSelectedInvestor(investor)
                            setInvestorSearchOpen(false)
                            setInvestorSearch('')
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm">
                                {investor.full_name || 'Sin nombre'}
                              </p>
                              <p className="text-slate-500 text-xs">{investor.email || '-'}</p>
                            </div>
                            <span className="text-slate-400 text-xs font-mono">
                              {investor.document_id || '-'}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section C: Transaction Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <DollarSign size={18} className="text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                C. Detalles de la Transacción
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Monto de Inversión <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    value={amount}
                    onChange={e => {
                      // Allow only numbers
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      if (value) {
                        setAmount(parseInt(value).toLocaleString('es-CO'))
                      } else {
                        setAmount('')
                      }
                    }}
                    placeholder="0"
                    className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
                {selectedLoan && amount && (
                  <p className="text-xs text-slate-500">
                    Máximo disponible: {formatCurrency(selectedLoan.remaining)}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Fecha de Inversión <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="date"
                    value={investmentDate}
                    onChange={e => setInvestmentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 [color-scheme:dark]"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Puedes seleccionar fechas pasadas
                </p>
              </div>
            </div>

            {/* Custom Rate Toggle */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomRate}
                  onChange={e => setUseCustomRate(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-300">
                  Usar tasa de interés personalizada (diferente a la del crédito)
                </span>
              </label>

              {useCustomRate && (
                <div className="relative max-w-xs">
                  <Percent
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="number"
                    value={customRate}
                    onChange={e => setCustomRate(e.target.value)}
                    placeholder="Ej: 18.5"
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full pl-9 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    % E.A.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              disabled={isPending}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !selectedLoan || !selectedInvestor || !amount}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Registrar Inversión
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
