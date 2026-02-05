import { LogOut } from 'lucide-react'

interface PropietarioUserInfoProps {
  name: string
  email: string
}

export default function PropietarioUserInfo({ name, email }: PropietarioUserInfoProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="p-4 border-t border-gray-200 mt-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-semibold text-sm">
          {initials || email[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name || 'Usuario'}</p>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>
      </div>

      <form action="/auth/signout" method="post" className="mt-4">
        <button
          type="submit"
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Cerrar Sesion</span>
        </button>
      </form>
    </div>
  )
}
