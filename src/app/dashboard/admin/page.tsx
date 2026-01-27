import { Users, FileText, TrendingUp, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="text-white p-8">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-amber-400">Panel de Administracion</h1>
        <p className="text-slate-400 mt-1">
          Bienvenido, Administrador
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-400">
              <Users size={24} />
            </div>
            <span className="text-slate-400 text-sm">Usuarios Totales</span>
          </div>
          <p className="text-3xl font-bold text-white">--</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
              <FileText size={24} />
            </div>
            <span className="text-slate-400 text-sm">Creditos Activos</span>
          </div>
          <p className="text-3xl font-bold text-white">--</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
              <TrendingUp size={24} />
            </div>
            <span className="text-slate-400 text-sm">Capital Total</span>
          </div>
          <p className="text-3xl font-bold text-white">--</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-500/10 rounded-full text-red-400">
              <AlertCircle size={24} />
            </div>
            <span className="text-slate-400 text-sm">En Mora</span>
          </div>
          <p className="text-3xl font-bold text-white">--</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-6">Actividad Reciente</h2>
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <p>Proximamente: Dashboard con metricas en tiempo real</p>
        </div>
      </div>
    </div>
  )
}
