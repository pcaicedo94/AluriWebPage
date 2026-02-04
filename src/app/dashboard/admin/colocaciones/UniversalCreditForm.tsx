'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  Search,
  User,
  CreditCard,
  Home,
  Users,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  Calculator
} from 'lucide-react'
import {
  searchDebtorByCedula,
  getInvestorsForSelect,
  createFullLoanRecord,
  getNextLoanCode,
  InvestorOption,
  DebtorSearchResult
} from './actions'

interface InvestorRow {
  investor_id: string
  investor_name: string
  amount: number
  percentage: number
}

interface FormData {
  // Debtor
  debtor_cedula: string
  debtor_id: string
  debtor_name: string
  debtor_email: string
  debtor_phone: string
  debtor_address: string
  is_new_debtor: boolean

  // Loan
  code: string
  amount_requested: number
  interest_rate_ea: number
  term_months: number

  // Property
  property_address: string
  property_city: string
  property_type: string
  commercial_value: number

  // Investors
  investors: InvestorRow[]
}

interface UniversalCreditFormProps {
  investors: InvestorOption[]
  nextCode: string
}

export default function UniversalCreditForm({ investors, nextCode }: UniversalCreditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchingDebtor, setSearchingDebtor] = useState(false)
  const [debtorFound, setDebtorFound] = useState<boolean | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [investorSearchOpen, setInvestorSearchOpen] = useState<number | null>(null)
  const [investorSearch, setInvestorSearch] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      code: nextCode,
      debtor_cedula: '',
      debtor_id: '',
      debtor_name: '',
      debtor_email: '',
      debtor_phone: '',
      debtor_address: '',
      is_new_debtor: false,
      amount_requested: 0,
      interest_rate_ea: 18,
      term_months: 12,
      property_address: '',
      property_city: '',
      property_type: 'urbano',
      commercial_value: 0,
      investors: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'investors'
  })

  const watchAmountRequested = watch('amount_requested')
  const watchCommercialValue = watch('commercial_value')
  const watchInvestors = watch('investors')
  const watchCedula = watch('debtor_cedula')

  // Calculate LTV
  const ltv = watchCommercialValue > 0 ? (watchAmountRequested / watchCommercialValue) * 100 : 0

  // Calculate total invested
  const totalInvested = watchInvestors?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
  const remainingToFund = watchAmountRequested - totalInvested
  const fundingPercentage = watchAmountRequested > 0 ? (totalInvested / watchAmountRequested) * 100 : 0

  // Debounced debtor search
  const searchDebtor = useCallback(async (cedula: string) => {
    if (cedula.length < 5) {
      setDebtorFound(null)
      return
    }

    setSearchingDebtor(true)
    const result = await searchDebtorByCedula(cedula)
    setSearchingDebtor(false)

    if (result.found) {
      setDebtorFound(true)
      setValue('debtor_id', result.id || '')
      setValue('debtor_name', result.full_name || '')
      setValue('debtor_email', result.email || '')
      setValue('debtor_phone', result.phone || '')
      setValue('debtor_address', result.address || '')
      setValue('is_new_debtor', false)
    } else {
      setDebtorFound(false)
      setValue('debtor_id', '')
      setValue('debtor_name', '')
      setValue('debtor_email', '')
      setValue('debtor_phone', '')
      setValue('debtor_address', '')
      setValue('is_new_debtor', true)
    }
  }, [setValue])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchCedula && watchCedula.length >= 5) {
        searchDebtor(watchCedula)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [watchCedula, searchDebtor])

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

  const handleAddInvestor = () => {
    append({
      investor_id: '',
      investor_name: '',
      amount: 0,
      percentage: 0
    })
  }

  const updateInvestorPercentage = (index: number, amount: number) => {
    if (watchAmountRequested > 0) {
      const percentage = (amount / watchAmountRequested) * 100
      setValue(`investors.${index}.percentage`, Math.round(percentage * 100) / 100)
    }
  }

  const updateInvestorAmount = (index: number, percentage: number) => {
    if (watchAmountRequested > 0) {
      const amount = (percentage / 100) * watchAmountRequested
      setValue(`investors.${index}.amount`, Math.round(amount))
    }
  }

  const selectInvestor = (index: number, investor: InvestorOption) => {
    setValue(`investors.${index}.investor_id`, investor.id)
    setValue(`investors.${index}.investor_name`, investor.full_name || '')
    setInvestorSearchOpen(null)
    setInvestorSearch('')
  }

  const filteredInvestors = investors.filter(inv => {
    const search = investorSearch.toLowerCase()
    return (
      (inv.full_name?.toLowerCase().includes(search) ?? false) ||
      (inv.document_id?.toLowerCase().includes(search) ?? false)
    )
  })

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    const result = await createFullLoanRecord({
      debtor_id: formData.is_new_debtor ? undefined : formData.debtor_id,
      new_debtor: formData.is_new_debtor ? {
        cedula: formData.debtor_cedula,
        full_name: formData.debtor_name,
        email: formData.debtor_email,
        phone: formData.debtor_phone,
        address: formData.debtor_address
      } : undefined,
      code: formData.code,
      amount_requested: formData.amount_requested,
      interest_rate_ea: formData.interest_rate_ea,
      term_months: formData.term_months,
      property: {
        address: formData.property_address,
        city: formData.property_city,
        property_type: formData.property_type,
        commercial_value: formData.commercial_value
      },
      investors: formData.investors.map(inv => ({
        investor_id: inv.investor_id,
        amount: inv.amount,
        percentage: inv.percentage
      }))
    })

    setIsSubmitting(false)

    if (result.success) {
      showToast('success', 'Credito creado exitosamente')
      // Reset form and get new code
      reset({
        code: 'CR-' + (parseInt(formData.code.split('-')[1]) + 1).toString().padStart(3, '0'),
        debtor_cedula: '',
        debtor_id: '',
        debtor_name: '',
        debtor_email: '',
        debtor_phone: '',
        debtor_address: '',
        is_new_debtor: false,
        amount_requested: 0,
        interest_rate_ea: 18,
        term_months: 12,
        property_address: '',
        property_city: '',
        property_type: 'urbano',
        commercial_value: 0,
        investors: []
      })
      setDebtorFound(null)
      router.refresh()
    } else {
      showToast('error', result.error || 'Error al crear el credito')
    }
  }

  const getLtvColor = () => {
    if (ltv <= 50) return 'text-emerald-400'
    if (ltv <= 70) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN - Asset Data */}
          <div className="space-y-6">
            {/* Debtor Section */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
                <User size={18} className="text-teal-400" />
                <h3 className="font-semibold text-white">Datos del Deudor</h3>
              </div>
              <div className="p-5 space-y-4">
                {/* Cedula Search */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Cedula <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      {...register('debtor_cedula', { required: true })}
                      type="text"
                      placeholder="Buscar por cedula..."
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    {searchingDebtor && (
                      <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                    )}
                    {!searchingDebtor && debtorFound === true && (
                      <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    )}
                  </div>
                  {debtorFound === true && (
                    <p className="text-xs text-emerald-400 mt-1">Deudor encontrado en el sistema</p>
                  )}
                  {debtorFound === false && (
                    <p className="text-xs text-amber-400 mt-1">Deudor nuevo - complete los datos abajo</p>
                  )}
                </div>

                {/* Debtor Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-slate-400 mb-1.5">Nombre Completo</label>
                    <input
                      {...register('debtor_name')}
                      type="text"
                      disabled={debtorFound === true}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                    <input
                      {...register('debtor_email')}
                      type="email"
                      disabled={debtorFound === true}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Telefono</label>
                    <input
                      {...register('debtor_phone')}
                      type="tel"
                      disabled={debtorFound === true}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Section */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
                <CreditCard size={18} className="text-teal-400" />
                <h3 className="font-semibold text-white">Datos del Credito</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Codigo</label>
                    <input
                      {...register('code', { required: true })}
                      type="text"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Monto Solicitado</label>
                    <input
                      {...register('amount_requested', { required: true, valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="100000"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Tasa E.A. (%)</label>
                    <input
                      {...register('interest_rate_ea', { required: true, valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Plazo (meses)</label>
                    <input
                      {...register('term_months', { required: true, valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Section */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
                <Home size={18} className="text-teal-400" />
                <h3 className="font-semibold text-white">Datos del Inmueble</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-slate-400 mb-1.5">Direccion</label>
                    <input
                      {...register('property_address')}
                      type="text"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Ciudad</label>
                    <input
                      {...register('property_city')}
                      type="text"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Tipo de Predio</label>
                    <select
                      {...register('property_type')}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="urbano">Urbano</option>
                      <option value="rural">Rural</option>
                      <option value="comercial">Comercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Avaluo Comercial</label>
                    <input
                      {...register('commercial_value', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="1000000"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">LTV Calculado</label>
                    <div className={`px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg font-semibold ${getLtvColor()}`}>
                      {ltv.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Funding */}
          <div className="space-y-6">
            {/* Investors Section */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-teal-400" />
                  <h3 className="font-semibold text-white">Fondeo / Inversionistas</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddInvestor}
                  className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  Agregar
                </button>
              </div>

              <div className="p-5">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin inversionistas</p>
                    <p className="text-xs mt-1">Haz clic en &quot;Agregar&quot; para anadir</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-3">
                        {/* Investor Selector */}
                        <div className="relative">
                          <label className="block text-xs text-slate-500 mb-1">Inversionista</label>
                          <button
                            type="button"
                            onClick={() => {
                              setInvestorSearchOpen(investorSearchOpen === index ? null : index)
                              setInvestorSearch('')
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-slate-600 transition-colors"
                          >
                            <span className={watchInvestors[index]?.investor_name ? 'text-white' : 'text-slate-500'}>
                              {watchInvestors[index]?.investor_name || 'Seleccionar...'}
                            </span>
                            <ChevronDown size={16} className="text-slate-400" />
                          </button>

                          {investorSearchOpen === index && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-30 max-h-48 overflow-hidden">
                              <div className="p-2 border-b border-slate-700">
                                <input
                                  type="text"
                                  value={investorSearch}
                                  onChange={e => setInvestorSearch(e.target.value)}
                                  placeholder="Buscar..."
                                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:outline-none"
                                  autoFocus
                                />
                              </div>
                              <div className="overflow-y-auto max-h-32">
                                {filteredInvestors.map(inv => (
                                  <button
                                    key={inv.id}
                                    type="button"
                                    onClick={() => selectInvestor(index, inv)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700/50 flex justify-between"
                                  >
                                    <span className="text-white">{inv.full_name}</span>
                                    <span className="text-slate-500 text-xs">{inv.document_id}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Amount and Percentage */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Monto</label>
                            <input
                              {...register(`investors.${index}.amount`, { valueAsNumber: true })}
                              type="number"
                              min="0"
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0
                                setValue(`investors.${index}.amount`, val)
                                updateInvestorPercentage(index, val)
                              }}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Porcentaje</label>
                            <div className="relative">
                              <input
                                {...register(`investors.${index}.percentage`, { valueAsNumber: true })}
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0
                                  setValue(`investors.${index}.percentage`, val)
                                  updateInvestorAmount(index, val)
                                }}
                                className="w-full px-3 py-2 pr-8 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">Total Recaudado</span>
                    <span className="text-lg font-bold text-teal-400">{formatCurrency(totalInvested)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">Monto del Credito</span>
                    <span className="text-lg font-medium text-white">{formatCurrency(watchAmountRequested)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400">Faltante</span>
                    <span className={`text-lg font-medium ${remainingToFund > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {formatCurrency(Math.max(0, remainingToFund))}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        fundingPercentage >= 100 ? 'bg-emerald-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, fundingPercentage)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    {fundingPercentage.toFixed(1)}% fondeado
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Crear Credito Completo
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
