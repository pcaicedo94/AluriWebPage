'use client'

import { useState } from 'react'
import { FileText, Users, Calendar, Building, Percent, Clock, UserPlus } from 'lucide-react'
import { LoanDetail, LoanCosigner, LoanInvestment } from '../actions'

interface LoanDetailTabsProps {
  loan: LoanDetail
  cosigners: LoanCosigner[]
  investments: LoanInvestment[]
}

type TabId = 'resumen' | 'inversionistas' | 'pagos'

export default function LoanDetailTabs({ loan, cosigners, investments }: LoanDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('resumen')

  const tabs = [
    { id: 'resumen' as TabId, label: 'Resumen', icon: FileText },
    { id: 'inversionistas' as TabId, label: 'Inversionistas', icon: Users },
    { id: 'pagos' as TabId, label: 'Tabla de Pagos', icon: Calendar },
  ]

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return `${value}%`
  }

  const getPaymentTypeLabel = (type: string | null) => {
    switch (type) {
      case 'interest_only':
        return 'Solo Intereses'
      case 'principal_and_interest':
        return 'Capital e Intereses'
      default:
        return type || '-'
    }
  }

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
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
      <div className="space-y-6">
        {/* Tab 1: Resumen */}
        {activeTab === 'resumen' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Financial Info Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Percent size={20} className="text-amber-400" />
                Informacion Financiera
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Monto Solicitado</span>
                  <span className="text-white font-semibold">{formatCurrency(loan.amount_requested)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Monto Fondeado</span>
                  <span className="text-primary font-semibold">{formatCurrency(loan.amount_funded || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Tasa NM</span>
                  <span className="text-white font-medium">{formatPercent(loan.interest_rate_nm)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Tasa EA</span>
                  <span className="text-white font-medium">{formatPercent(loan.interest_rate_ea)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Plazo</span>
                  <span className="text-white font-medium">{loan.term_months} meses</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Tipo de Pago</span>
                  <span className="text-white font-medium">{getPaymentTypeLabel(loan.payment_type)}</span>
                </div>
              </div>
            </div>

            {/* Guarantee Info Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Building size={20} className="text-amber-400" />
                Garantia (Inmueble)
              </h3>
              {loan.property_info ? (
                <div className="space-y-4">
                  <div className="py-2 border-b border-slate-700">
                    <span className="text-slate-400 text-sm block mb-1">Direccion</span>
                    <span className="text-white">{loan.property_info.address || '-'}</span>
                  </div>
                  <div className="py-2 border-b border-slate-700">
                    <span className="text-slate-400 text-sm block mb-1">Ciudad</span>
                    <span className="text-white">{loan.property_info.city || '-'}</span>
                  </div>
                  <div className="py-2 border-b border-slate-700">
                    <span className="text-slate-400 text-sm block mb-1">Valor Comercial</span>
                    <span className="text-white font-semibold">{formatCurrency(loan.property_info.commercial_value)}</span>
                  </div>
                  <div className="py-2">
                    <span className="text-slate-400 text-sm block mb-1">Matricula Inmobiliaria</span>
                    <span className="text-white font-mono">{loan.property_info.registration_number || '-'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No hay informacion de garantia</p>
              )}
            </div>

            {/* Cosigners Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Users size={20} className="text-amber-400" />
                Codeudores ({cosigners.length})
              </h3>
              {cosigners.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-sm border-b border-slate-700">
                        <th className="pb-3 font-medium">Nombre</th>
                        <th className="pb-3 font-medium">Cedula</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Telefono</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {cosigners.map((cosigner) => (
                        <tr key={cosigner.id} className="border-b border-slate-700/50">
                          <td className="py-3 text-white font-medium">{cosigner.full_name}</td>
                          <td className="py-3 text-slate-300 font-mono">{cosigner.cedula}</td>
                          <td className="py-3 text-slate-300">{cosigner.email || '-'}</td>
                          <td className="py-3 text-slate-300">{cosigner.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No hay codeudores registrados</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Inversionistas */}
        {activeTab === 'inversionistas' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Inversionistas</h3>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium rounded-lg border border-amber-500/30 transition-colors"
              >
                <UserPlus size={18} />
                Agregar Inversionista Manual
              </button>
            </div>

            {investments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-sm border-b border-slate-700 uppercase tracking-wider">
                      <th className="pb-3 font-medium">Inversionista</th>
                      <th className="pb-3 font-medium text-right">Monto</th>
                      <th className="pb-3 font-medium text-center">Estado</th>
                      <th className="pb-3 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {investments.map((investment) => (
                      <tr key={investment.id} className="border-b border-slate-700/50">
                        <td className="py-4">
                          <div>
                            <p className="text-white font-medium">{investment.investor?.full_name || 'Sin nombre'}</p>
                            <p className="text-slate-400 text-xs">{investment.investor?.email}</p>
                          </div>
                        </td>
                        <td className="py-4 text-right text-white font-semibold">
                          {formatCurrency(investment.amount)}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            investment.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {investment.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-4 text-slate-300">
                          {new Date(investment.created_at).toLocaleDateString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay inversiones registradas</p>
                <p className="text-sm mt-1">Los inversionistas apareceran aqui cuando inviertan en este credito.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tabla de Pagos */}
        {activeTab === 'pagos' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
              <Calendar size={20} className="text-amber-400" />
              Tabla de Pagos
            </h3>

            <div className="text-center py-12">
              <Clock size={48} className="mx-auto mb-4 text-slate-500 opacity-50" />
              <p className="text-slate-400 text-lg font-medium">Calendario Pendiente</p>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                El calendario de pagos se generara automaticamente cuando se complete el proceso de fondeo y se defina la fecha de desembolso.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
