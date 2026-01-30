import { Settings } from 'lucide-react'

export default function ConfiguracionPage() {
  return (
    <div className="text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Configuracion</h1>
        <p className="text-zinc-500 mt-1">
          Ajustes de tu cuenta
        </p>
      </header>

      <div className="flex flex-col items-center justify-center h-64 bg-zinc-900 rounded-xl border border-zinc-700">
        <Settings size={48} className="text-zinc-500 mb-4" />
        <p className="text-zinc-500">Proximamente...</p>
      </div>
    </div>
  )
}
