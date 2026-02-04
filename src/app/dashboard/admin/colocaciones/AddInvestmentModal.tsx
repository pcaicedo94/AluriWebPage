'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Search,
  Loader2,
  Check,
  AlertCircle,
  Banknote,
  Calendar,
  User,
  ChevronDown
} from 'lucide-react'
import {
  LoanTableRow,
  InvestorOption,
  searchInvestorByCedula,
  addInvestmentToLoan
} from './actions'

interface AddInvestmentModalProps {
  loan: LoanTableRow
  investors: InvestorOption[]
  isOpen: boolean
  onClose: () => void
}

export default function AddInvestmentModal({ loan, investors, isOpen, onClose }: AddInvestmentModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Investor state
  const [investorCedula, setInvestorCedula] = useState('')
  const [investorId, setInvestorId] = useState('')
  const [investorName, setInvestorName] = useState('')
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle')
  const [isNewInvestor, setIsNewInvestor] = useState(false)
  const [newInvestorName, setNewInvestorName] = useState('')
  const [newInvestorEmail, setNewInvestorEmail] = useState('')
  const [newInvestorPhone, setNewInvestorPhone] = useState('')

  // Investment state
  const [amount, setAmount] = useState<number>(0)
  const [investmentDate, setInvestmentDate] = useState(new Date().toISOString().split('T')[0])

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownSearch, setDropdownSearch] = useState('')

  // Calculate remaining capacity
  const requested = loan.amount_requested || 0
  const funded = loan.amount_funded || 0
  const remaining = requested - funded

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // Search investor by cedula
  const handleCedulaSearch = useCallback(async (cedula: string) => {
    setInvestorCedula(cedula)

    if (cedula.length < 5) {
      setSearchStatus('idle')
      setInvestorId('')
      setInvestorName('')
      setIsNewInvestor(false)
      return
    }

    setSearchStatus('searching')

    // First check in existing investors list
    const existing = investors.find(inv => inv.document_id === cedula)
    if (existing) {
      setInvestorId(existing.id)
      setInvestorName(existing.full_name || '')
      setIsNewInvestor(false)
      setSearchStatus('found')
      return
    }

    // Search in database
    const result = await searchInvestorByCedula(cedula)
    if (result.found) {
      setInvestorId(result.id || '')
      setInvestorName(result.full_name || '')
      setIsNewInvestor(false)
      setSearchStatus('found')
    } else {
      setInvestorId('')
      setInvestorName('')
      setIsNewInvestor(true)
      setSearchStatus('not_found')
    }
  }, [investors])

  // Select from dropdown
  const selectInvestor = (inv: InvestorOption) => {
    setInvestorId(inv.id)
    setInvestorName(inv.full_name || '')
    setInvestorCedula(inv.document_id || '')
    setIsNewInvestor(false)
    setSearchStatus('found')
    setDropdownOpen(false)
    setDropdownSearch('')
  }

  const filteredInvestors = investors.filter(inv => {
    const search = dropdownSearch.toLowerCase()
    return (
      (inv.full_name?.toLowerCase().includes(search) ?? false) ||
      (inv.document_id?.toLowerCase().includes(search) ?? false)
    )
  })

  const resetForm = () => {
    setInvestorCedula('')
    setInvestorId('')
    setInvestorName('')
    setSearchStatus('idle')
    setIsNewInvestor(false)
    setNewInvestorName('')
    setNewInvestorEmail('')
    setNewInvestorPhone('')
    setAmount(0)
    setInvestmentDate(new Date().toISOString().split('T')[0])
  }

  const handleSubmit = async () => {
    // Validation
    if (!investorId && !isNewInvestor) {
      showToast('error', 'Seleccione o cree un inversionista')
      return
    }

    if (isNewInvestor && (!newInvestorName || !newInvestorEmail)) {
      showToast('error', 'Complete los datos del nuevo inversionista')
      return
    }

    if (!amount || amount <= 0) {
      showToast('error', 'Ingrese un monto valido')
      return
    }

    if (amount > remaining) {
      showToast('error', `El monto excede el cupo disponible (${formatCurrency(remaining)})`)
      return
    }

    setIsSubmitting(true)

    const result = await addInvestmentToLoan({
      loan_id: loan.id,
      investor_id: isNewInvestor ? undefined : investorId,
      is_new_investor: isNewInvestor,
      new_investor: isNewInvestor ? {
        cedula: investorCedula,
        full_name: newInvestorName,
        email: newInvestorEmail,
        phone: newInvestorPhone
      } : undefined,
      amount,
      investment_date: investmentDate
    })

    setIsSubmitting(false)

    if (result.success) {
      showToast('success', 'Inversion agregada exitosamente')
      resetForm()
      router.refresh()
      setTimeout(() => onClose(), 1500)
    } else {
      showToast('error', result.error || 'Error al agregar inversion')
    }
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-lg shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <Banknote size={20} className="text-teal-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Agregar Inversion</h2>
                <p className="text-xs text-slate-500">Credito {loan.code}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Loan Info */}
          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500">Monto Solicitado</p>
                <p className="text-sm font-medium text-white">{formatCurrency(requested)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Recaudado</p>
                <p className="text-sm font-medium text-teal-400">{formatCurrency(funded)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cupo Disponible</p>
                <p className="text-sm font-bold text-amber-400">{formatCurrency(remaining)}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {/* Investor Search */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Inversionista</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={investorCedula}
                    onChange={(e) => handleCedulaSearch(e.target.value)}
                    placeholder="Buscar por cedula..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  {searchStatus === 'searching' && (
                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                  )}
                  {searchStatus === 'found' && (
                    <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronDown size={18} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 max-h-56 overflow-hidden">
                      <div className="p-2 border-b border-slate-700">
                        <input
                          type="text"
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          placeholder="Filtrar..."
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-40">
                        {filteredInvestors.map((inv) => (
                          <button
                            key={inv.id}
                            type="button"
                            onClick={() => selectInvestor(inv)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700/50 flex justify-between"
                          >
                            <span className="text-white truncate">{inv.full_name}</span>
                            <span className="text-slate-500 text-xs ml-2">{inv.document_id}</span>
                          </button>
                        ))}
                        {filteredInvestors.length === 0 && (
                          <p className="px-3 py-2 text-sm text-slate-500">Sin resultados</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Found investor */}
              {searchStatus === 'found' && investorName && (
                <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-sm text-emerald-400 flex items-center gap-2">
                    <User size={14} />
                    {investorName}
                  </p>
                </div>
              )}

              {/* New investor form */}
              {searchStatus === 'not_found' && isNewInvestor && (
                <div className="mt-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-3">
                  <p className="text-xs text-amber-400 font-medium">Nuevo inversionista - Complete los datos:</p>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={newInvestorName}
                      onChange={(e) => setNewInvestorName(e.target.value)}
                      placeholder="Nombre completo *"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    <input
                      type="email"
                      value={newInvestorEmail}
                      onChange={(e) => setNewInvestorEmail(e.target.value)}
                      placeholder="Email *"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    <input
                      type="tel"
                      value={newInvestorPhone}
                      onChange={(e) => setNewInvestorPhone(e.target.value)}
                      placeholder="Telefono (opcional)"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Monto a Invertir</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  max={remaining}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>
              {amount > remaining && (
                <p className="text-xs text-red-400 mt-1">Excede el cupo disponible</p>
              )}
              {amount > 0 && amount <= remaining && (
                <p className="text-xs text-slate-500 mt-1">
                  {((amount / requested) * 100).toFixed(1)}% del credito
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Fecha de Inversion</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="date"
                  value={investmentDate}
                  onChange={(e) => setInvestmentDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || amount > remaining || amount <= 0 || (!investorId && !isNewInvestor)}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Agregar Inversion
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
