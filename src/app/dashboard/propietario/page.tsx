import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerDashboard() {
  const supabase = createClient()

  // 1. Verificación de Sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login/propietario')
  }

  // 2. Verificación de Rol (Defensa en profundidad)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // Si un inversionista "hacker" intenta entrar aquí cambiando la URL, lo expulsamos
  if (profile?.role !== 'propietario') {
    return redirect('/dashboard/inversionista')
  }

  // 3. CONSULTA RLS: Traer mis propiedades
  // La base de datos filtrará automáticamente usando "auth.uid() = owner_id"
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 p-8">
      {/* Header Claro */}
      <header className="mb-10 flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel de Propietario</h1>
          <p className="text-slate-500">Bienvenido, {profile?.full_name || user.email}</p>
        </div>
        <form action="/auth/signout" method="post">
            <button className="bg-white border border-gray-300 text-slate-600 px-4 py-2 rounded hover:bg-gray-50 shadow-sm">
              Cerrar Sesión
            </button>
        </form>
      </header>

      <main>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Mis Propiedades Publicadas</h2>
          <button className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 text-sm font-medium shadow">
            + Nueva Propiedad
          </button>
        </div>
        
        {properties && properties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop: any) => (
              <div key={prop.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-32 bg-slate-100 rounded-lg mb-4 flex items-center justify-center text-slate-400">
                  {/* Aquí iría una foto real en el futuro */}
                  <span className="text-4xl">🏢</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{prop.address}</h3>
                <p className="text-sm text-slate-500 mb-4">ID: {prop.id.slice(0, 8)}...</p>
                
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Valuación Actual</span>
                  <span className="font-bold text-emerald-600 text-lg">${prop.valuation}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-xl text-center border border-dashed border-gray-300">
            <div className="text-4xl mb-4">🏠</div>
            <p className="text-slate-600 font-medium">No tienes propiedades registradas.</p>
            <p className="text-sm text-slate-400 mt-2">Contacta a soporte para dar de alta tu primer inmueble.</p>
          </div>
        )}
      </main>
    </div>
  )
}
