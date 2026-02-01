'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, User, Building, DollarSign, Users, ArrowLeft } from 'lucide-react'
import { createLoan, Propietario, Cosigner, CreateLoanData } from '../actions'
import Link from 'next/link'

interface NuevoCreditoFormProps {
  propietarios: Propietario[]
}

type TabId = 'deudor' | 'financiero' | 'codeudores'

export default function NuevoCreditoForm({ propietarios }: NuevoCreditoFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('deudor')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Section A: Deudor y Garantia
  const [borrowerId, setBorrowerId] = useState('')
  const [code, setCode] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [propertyCity, setPropertyCity] = useState('')
  const [propertyValue, setPropertyValue] = useState('')
  const [propertyRegistration, setPropertyRegistration] = useState('')

  // Section B: Condiciones Financieras
  const [amountRequested, setAmountRequested] = useState('')
  const [interestRateNm, setInterestRateNm] = useState('')
  const [interestRateEa, setInterestRateEa] = useState('')
  const [termMonths, setTermMonths] = useState('')
  const [paymentType, setPaymentType] = useState<'interest_only' | 'principal_and_interest'>('interest_only')
  const [signatureDate, setSignatureDate] = useState('')
  const [disbursementDate, setDisbursementDate] = useState('')

  // Section C: Codeudores
  const [cosigners, setCosigners] = useState<Cosigner[]>([])

  const addCosigner = () => {
    setCosigners([...cosigners, { full_name: '', cedula: '', email: '', phone: '' }])
  }

  const removeCosigner = (index: number) => {
    setCosigners(cosigners.filter((_, i) => i !== index))
  }

  const updateCosigner = (index: number, field: keyof Cosigner, value: string) => {
    const updated = [...cosigners]
    updated[index] = { ...updated[index], [field]: value }
    setCosigners(updated)
  }

  const tabs = [
    { id: 'deudor' as TabId, label: 'Deudor y Garantia', icon: User },
    { id: 'financiero' as TabId, label: 'Condiciones Financieras', icon: DollarSign },
    { id: 'codeudores' as TabId, label: 'Codeudores', icon: Users },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const loanData: CreateLoanData = {
        borrower_id: borrowerId,
        code: code,
        property_info: {
          address: propertyAddress,
          city: propertyCity,
          commercial_value: parseFloat(propertyValue) || 0,
          registration_number: propertyRegistration
        },
        amount_requested: parseFloat(amountRequested) || 0,
        interest_rate_nm: parseFloat(interestRateNm) || 0,
        interest_rate_ea: parseFloat(interestRateEa) || 0,
        term_months: parseInt(termMonths) || 0,
        payment_type: paymentType,
        dates: {
          signature_date: signatureDate || null,
          disbursement_date: disbursementDate || null
        },
        cosigners: cosigners
      }

      const result = await createLoan(loanData)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/dashboard/admin/creditos')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error al crear el credito. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5"

  return (
    <div className="max-w-4xl">
      {/* Back Link */}
      <Link
        href="/dashboard/admin/creditos"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Volver a Creditos</span>
      </Link>

      <form onSubmit={handleSubmit}>
        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          {/* Section A: Deudor y Garantia */}
          {activeTab === 'deudor' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <User size={20} className="text-amber-400" />
                Informacion del Deudor y Garantia
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass} htmlFor="borrowerId">
                    Deudor (Propietario) *
                  </label>
                  <select
                    id="borrowerId"
                    value={borrowerId}
                    onChange={(e) => setBorrowerId(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Seleccionar propietario...</option>
                    {propietarios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || 'Sin nombre'} - {p.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="code">
                    Codigo del Credito *
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    placeholder="CR005"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6 mt-6">
                <h4 className="text-md font-medium text-slate-300 flex items-center gap-2 mb-4">
                  <Building size={18} className="text-amber-400" />
                  Datos de la Garantia (Inmueble)
                </h4>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="propertyAddress">
                      Direccion
                    </label>
                    <input
                      type="text"
                      id="propertyAddress"
                      value={propertyAddress}
                      onChange={(e) => setPropertyAddress(e.target.value)}
                      placeholder="Calle 123 # 45-67, Apto 101"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="propertyCity">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      id="propertyCity"
                      value={propertyCity}
                      onChange={(e) => setPropertyCity(e.target.value)}
                      placeholder="Bogota"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="propertyValue">
                      Valor Comercial (COP)
                    </label>
                    <input
                      type="number"
                      id="propertyValue"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      placeholder="500000000"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="propertyRegistration">
                      Matricula Inmobiliaria
                    </label>
                    <input
                      type="text"
                      id="propertyRegistration"
                      value={propertyRegistration}
                      onChange={(e) => setPropertyRegistration(e.target.value)}
                      placeholder="050N-12345678"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section B: Condiciones Financieras */}
          {activeTab === 'financiero' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-amber-400" />
                Condiciones Financieras
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass} htmlFor="amountRequested">
                    Monto Solicitado (COP) *
                  </label>
                  <input
                    type="number"
                    id="amountRequested"
                    value={amountRequested}
                    onChange={(e) => setAmountRequested(e.target.value)}
                    required
                    placeholder="100000000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="termMonths">
                    Plazo (Meses) *
                  </label>
                  <input
                    type="number"
                    id="termMonths"
                    value={termMonths}
                    onChange={(e) => setTermMonths(e.target.value)}
                    required
                    placeholder="12"
                    min={1}
                    max={120}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="interestRateNm">
                    Tasa NM (%)
                  </label>
                  <input
                    type="number"
                    id="interestRateNm"
                    value={interestRateNm}
                    onChange={(e) => setInterestRateNm(e.target.value)}
                    placeholder="1.7"
                    step="0.01"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="interestRateEa">
                    Tasa EA (%)
                  </label>
                  <input
                    type="number"
                    id="interestRateEa"
                    value={interestRateEa}
                    onChange={(e) => setInterestRateEa(e.target.value)}
                    placeholder="22.4"
                    step="0.01"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="paymentType">
                    Tipo de Pago *
                  </label>
                  <select
                    id="paymentType"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'interest_only' | 'principal_and_interest')}
                    required
                    className={inputClass}
                  >
                    <option value="interest_only">Solo Intereses</option>
                    <option value="principal_and_interest">Capital e Intereses</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6 mt-6">
                <h4 className="text-md font-medium text-slate-300 mb-4">Fechas</h4>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass} htmlFor="signatureDate">
                      Fecha de Firma
                    </label>
                    <input
                      type="date"
                      id="signatureDate"
                      value={signatureDate}
                      onChange={(e) => setSignatureDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="disbursementDate">
                      Fecha de Desembolso
                    </label>
                    <input
                      type="date"
                      id="disbursementDate"
                      value={disbursementDate}
                      onChange={(e) => setDisbursementDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section C: Codeudores */}
          {activeTab === 'codeudores' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users size={20} className="text-amber-400" />
                  Codeudores
                </h3>
                <button
                  type="button"
                  onClick={addCosigner}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium rounded-lg border border-amber-500/30 transition-colors"
                >
                  <Plus size={18} />
                  Agregar Codeudor
                </button>
              </div>

              {cosigners.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No hay codeudores agregados.</p>
                  <p className="text-sm mt-1">Haz clic en &quot;Agregar Codeudor&quot; para anadir uno.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cosigners.map((cosigner, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/50 rounded-xl p-4 border border-slate-700"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-slate-400">
                          Codeudor #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCosigner(index)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Nombre Completo *</label>
                          <input
                            type="text"
                            value={cosigner.full_name}
                            onChange={(e) => updateCosigner(index, 'full_name', e.target.value)}
                            placeholder="Juan Perez"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Cedula *</label>
                          <input
                            type="text"
                            value={cosigner.cedula}
                            onChange={(e) => updateCosigner(index, 'cedula', e.target.value)}
                            placeholder="1234567890"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Email</label>
                          <input
                            type="email"
                            value={cosigner.email}
                            onChange={(e) => updateCosigner(index, 'email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Telefono</label>
                          <input
                            type="tel"
                            value={cosigner.phone}
                            onChange={(e) => updateCosigner(index, 'phone', e.target.value)}
                            placeholder="300 123 4567"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/admin/creditos"
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-semibold rounded-lg transition-colors"
          >
            {isLoading ? 'Creando...' : 'Crear Credito'}
          </button>
        </div>
      </form>
    </div>
  )
}
