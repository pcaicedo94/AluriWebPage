import { createClient } from '../../../../utils/supabase/server'
import { FileText, Building2, DollarSign, Hash, Calendar, TrendingUp } from 'lucide-react'

// Helper para formatear moneda
function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

interface PropertyInfo {
  city?: string
  department?: string
  address?: string
  property_type?: string
  property_value?: number
  matricula?: string
}

export default async function CreditosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch loans where user is owner
  const { data: loans } = await supabase
    .from('loans')
    .select(`
      id,
      code,
      status,
      amount_requested,
      amount_funded,
      interest_rate_nm,
      interest_rate_ea,
      property_info,
      created_at
    `)
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

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

  const getPropertyTypeLabel = (type: string | undefined) => {
    const types: Record<string, string> = {
      casa: 'Casa',
      apartamento: 'Apartamento',
      lote: 'Lote',
      predio_rural: 'Predio Rural',
      oficina: 'Oficina',
      bodega: 'Bodega',
      local_comercial: 'Local Comercial',
    }
    return type ? types[type] || type : 'No especificado'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-xl">
          <FileText size={24} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Creditos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Informacion detallada de tus creditos
          </p>
        </div>
      </header>

      {/* Credits List */}
      {loans && loans.length > 0 ? (
        <div className="space-y-6">
          {loans.map((loan) => {
            const propertyInfo = loan.property_info as PropertyInfo | null
            const fundingProgress = loan.amount_requested > 0
              ? Math.round((loan.amount_funded / loan.amount_requested) * 100)
              : 0

            return (
              <div key={loan.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-xl">
                        <Building2 size={24} className="text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{loan.code}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(loan.status)}`}>
                            {getStatusLabel(loan.status)}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                          {propertyInfo?.city || 'Sin ubicacion'}{propertyInfo?.department ? `, ${propertyInfo.department}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Creado</p>
                      <p className="text-sm text-gray-600">{formatDate(loan.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Codigo */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Hash size={14} />
                        <span>Codigo</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{loan.code}</p>
                    </div>

                    {/* Estado */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Calendar size={14} />
                        <span>Estado</span>
                      </div>
                      <p className="text-gray-900 font-semibold">{getStatusLabel(loan.status)}</p>
                    </div>

                    {/* Valor Inmueble */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Building2 size={14} />
                        <span>Valor Inmueble</span>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {propertyInfo?.property_value
                          ? formatCOP(propertyInfo.property_value)
                          : 'No registrado'}
                      </p>
                    </div>

                    {/* Monto Solicitado */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <DollarSign size={14} />
                        <span>Monto Solicitado</span>
                      </div>
                      <p className="text-emerald-600 font-semibold">{formatCOP(loan.amount_requested)}</p>
                    </div>
                  </div>

                  {/* Additional Info Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
                    {/* Tipo de Predio */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Building2 size={14} />
                        <span>Tipo de Predio</span>
                      </div>
                      <p className="text-gray-900">{getPropertyTypeLabel(propertyInfo?.property_type)}</p>
                    </div>

                    {/* Tasa EA */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <TrendingUp size={14} />
                        <span>Tasa EA</span>
                      </div>
                      <p className="text-gray-900">{loan.interest_rate_ea ? `${loan.interest_rate_ea}%` : '-'}</p>
                    </div>

                    {/* Matricula */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Hash size={14} />
                        <span>Matricula</span>
                      </div>
                      <p className="text-gray-900">{propertyInfo?.matricula || 'No registrada'}</p>
                    </div>

                    {/* Monto Fondeado */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <DollarSign size={14} />
                        <span>Monto Fondeado</span>
                      </div>
                      <p className="text-gray-900">{formatCOP(loan.amount_funded)}</p>
                    </div>
                  </div>

                  {/* Funding Progress Bar */}
                  {(loan.status === 'fundraising' || loan.status === 'active') && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Progreso de Fondeo</span>
                        <span className="text-sm font-medium text-gray-900">{fundingProgress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>{formatCOP(loan.amount_funded)} fondeado</span>
                        <span>{formatCOP(loan.amount_requested)} objetivo</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium">No tienes creditos registrados</p>
          <p className="text-sm text-gray-400 mt-2">Contacta a soporte para mas informacion</p>
        </div>
      )}
    </div>
  )
}
