import { Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getProfile } from './actions'
import ConfigForm from './ConfigForm'
import { redirect } from 'next/navigation'

export default async function ConfiguracionPage() {
  const result = await getProfile()

  if (result.error) {
    redirect('/login')
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header>
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span>Volver al Panel</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-500/10 rounded-xl">
            <Settings size={24} className="text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Configuracion</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Administra tu perfil y seguridad
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <ConfigForm initialData={result.data!} />
    </div>
  )
}
