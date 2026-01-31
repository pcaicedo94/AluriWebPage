import { createClient } from '../../../../utils/supabase/server'
import { Users, Shield } from 'lucide-react'
import NuevoUsuarioButton from './NuevoUsuarioButton'

interface UserProfile {
  id: string
  full_name: string | null
  role: string
  created_at: string
  email?: string
}

export default async function AdminUsuariosPage() {
  const supabase = await createClient()

  // Fetch all users from profiles table
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error.message)
  }

  const usersList = (users || []) as UserProfile[]

  // Count by role
  const adminCount = usersList.filter(u => u.role === 'admin').length
  const inversorCount = usersList.filter(u => u.role === 'inversionista' || u.role === 'inversor').length
  const propietarioCount = usersList.filter(u => u.role === 'propietario').length

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'inversionista':
      case 'inversor':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'propietario':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="text-white p-8">
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Panel de Administracion de Usuarios</h1>
          <p className="text-slate-400 mt-1">
            Bienvenido, Administrador
          </p>
        </div>
        <NuevoUsuarioButton />
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-400">
              <Shield size={24} />
            </div>
            <span className="text-slate-400 text-sm">Administradores</span>
          </div>
          <p className="text-3xl font-bold text-white">{adminCount}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
              <Users size={24} />
            </div>
            <span className="text-slate-400 text-sm">Inversionistas</span>
          </div>
          <p className="text-3xl font-bold text-white">{inversorCount}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
              <Users size={24} />
            </div>
            <span className="text-slate-400 text-sm">Propietarios</span>
          </div>
          <p className="text-3xl font-bold text-white">{propietarioCount}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-6">Listado de Usuarios</h2>

        {usersList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-sm border-b border-slate-700 uppercase tracking-wider">
                  <th className="pb-4 px-2 font-medium">ID</th>
                  <th className="pb-4 px-2 font-medium">Nombre</th>
                  <th className="pb-4 px-2 font-medium">Rol</th>
                  <th className="pb-4 px-2 font-medium">Fecha Registro</th>
                  <th className="pb-4 px-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {usersList.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-4 px-2 font-mono text-slate-400 text-xs">
                      {user.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-2 font-medium text-white">
                      {user.full_name || 'Sin nombre'}
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-slate-300">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-4 px-2">
                      <button className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Users size={48} className="mb-4 opacity-50" />
            <p>No se encontraron usuarios.</p>
          </div>
        )}
      </div>
    </div>
  )
}
