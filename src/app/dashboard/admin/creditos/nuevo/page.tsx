import { getPropietarios } from '../actions'
import NuevoCreditoForm from './NuevoCreditoForm'

export default async function NuevoCreditoPage() {
  const { data: propietarios, error } = await getPropietarios()

  if (error) {
    console.error('Error fetching propietarios:', error)
  }

  return (
    <div className="text-white p-8">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-emerald-400">Nuevo Credito</h1>
        <p className="text-slate-400 mt-1">
          Completa el formulario para crear un nuevo credito
        </p>
      </header>

      <NuevoCreditoForm propietarios={propietarios || []} />
    </div>
  )
}
