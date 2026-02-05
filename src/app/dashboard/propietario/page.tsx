import { createClient } from '../../../utils/supabase/server'
import { LayoutDashboard, FileText, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// Helper para formatear moneda
function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function PropietarioPanel() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  // Fetch loans where user is owner
  const { data: loans } = await supabase
    .from('loans')
    .select('id, code, status, amount_requested, amount_funded, property_info, created_at')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  const totalLoans = loans?.length || 0
  const activeLoans = loans?.filter(l => l.status === 'active' || l.status === 'fundraising').length || 0
  const totalRequested = loans?.reduce((sum, loan) => sum + (loan.amount_requested || 0), 0) || 0
  const totalFunded = loans?.reduce((sum, loan) => sum + (loan.amount_funded || 0), 0) || 0

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador'
      case 'fundraising': return 'En Fondeo'
      case 'active': return 'Activo'
      case 'paid': return 'Pagado'
      case 'defaulted': return 'En Mora'
      default: return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'fundraising': return 'bg-amber-50 text-amber-600 border-amber-200'
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      case 'paid': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'defaulted': return 'bg-red-50 text-red-600 border-red-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-xl">
          <LayoutDashboard size={24} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Propietario</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Bienvenido, {profile?.full_name || 'Propietario'}
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600">
              <FileText size={24} />
            </div>
            <span className="text-gray-500 text-sm">Total Creditos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalLoans}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600">
              <CheckCircle size={24} />
            </div>
            <span className="text-gray-500 text-sm">Creditos Activos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeLoans}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-600">
              <Clock size={24} />
            </div>
            <span className="text-gray-500 text-sm">Total Solicitado</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCOP(totalRequested)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600">
              <CheckCircle size={24} />
            </div>
            <span className="text-gray-500 text-sm">Total Fondeado</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCOP(totalFunded)}</p>
        </div>
      </div>

      {/* Recent Loans */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Mis Creditos Recientes</h2>
          <Link
            href="/dashboard/propietario/creditos"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
          >
            Ver todos
          </Link>
        </div>

        {loans && loans.length > 0 ? (
          <div className="space-y-4">
            {loans.slice(0, 5).map((loan) => {
              const propertyInfo = loan.property_info as { city?: string; property_type?: string } | null
              return (
                <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <FileText size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{loan.code}</p>
                      <p className="text-gray-500 text-sm">
                        {propertyInfo?.city || 'Sin ciudad'}
                        {propertyInfo?.property_type ? ` - ${propertyInfo.property_type}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(loan.status)}`}>
                      {getStatusLabel(loan.status)}
                    </span>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatCOP(loan.amount_requested)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <FileText size={48} className="mb-4 opacity-50" />
            <p className="text-gray-600">No tienes creditos registrados</p>
            <p className="text-sm mt-1">Contacta a soporte para mas informacion</p>
          </div>
        )}
      </div>
    </div>
  )
}
