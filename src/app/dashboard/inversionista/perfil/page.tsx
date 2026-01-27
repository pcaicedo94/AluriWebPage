import { User } from 'lucide-react'

export default function PerfilPage() {
  return (
    <div className="text-white p-8">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-primary">Perfil</h1>
        <p className="text-slate-400 mt-1">
          Tu informacion personal
        </p>
      </header>

      <div className="flex flex-col items-center justify-center h-64 bg-slate-800 rounded-2xl border border-slate-700">
        <User size={48} className="text-slate-500 mb-4" />
        <p className="text-slate-400">Proximamente...</p>
      </div>
    </div>
  )
}
