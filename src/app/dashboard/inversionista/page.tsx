import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function InvestorDashboard() {
  const supabase = createClient()

  // 1. Verificamos sesión (Doble capa de seguridad)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login/inversionista')
  }

  // 2. Obtenemos el perfil para saludar
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // 3. CONSULTA SEGURA: Pedimos "todas" las inversiones.
  // Gracias al RLS, Postgres solo devolverá las tuyas.
  const { data: investments } = await supabase
    .from('investments')
    .select(`
      amount_invested,
      roi_percentage,
      properties (
        address,
        valuation
      )
    `)

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-10 flex justify-between items-center border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Panel de Inversionista</h1>
          <p className="text-slate-400">Bienvenido, {profile?.full_name || user.email}</p>
        </div>
        <form action="/auth/signout" method="post">
             {/* Necesitaremos crear esta ruta de signout luego, por ahora es visual */}
            <button className="bg-red-500/10 text-red-400 px-4 py-2 rounded hover:bg-red-500/20">
              Cerrar Sesión
            </button>
        </form>
      </header>

      <main>
        <h2 className="text-xl mb-4 font-semibold">Mis Inversiones Activas</h2>
        
        {investments && investments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {investments.map((inv: any, index: number) => (
              <div key={index} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{inv.properties?.address || 'Propiedad Desconocida'}</h3>
                    <span className="text-xs text-slate-400">Valuación: ${inv.properties?.valuation}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">
                    Activo
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invertido:</span>
                    <span className="font-mono font-bold">${inv.amount_invested}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ROI Estimado:</span>
                    <span className="font-mono text-emerald-400">{inv.roi_percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 bg-slate-800/50 rounded-xl text-center border border-dashed border-slate-700">
            <p className="text-slate-400">No tienes inversiones registradas aún.</p>
            <p className="text-sm text-slate-500 mt-2">(Si ves esto y acabas de insertar datos, revisa las políticas RLS)</p>
          </div>
        )}
      </main>
    </div>
  )
}
