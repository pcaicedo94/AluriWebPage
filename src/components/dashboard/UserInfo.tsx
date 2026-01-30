import { LogOut } from 'lucide-react'

interface UserInfoProps {
  name: string
  email: string
}

export default function UserInfo({ name, email }: UserInfoProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="p-4 border-t border-zinc-800 mt-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
          {initials || email[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{name || 'Usuario'}</p>
          <p className="text-xs text-zinc-500 truncate">{email}</p>
        </div>
      </div>

      <form action="/auth/signout" method="post" className="mt-4">
        <button
          type="submit"
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Cerrar Sesion</span>
        </button>
      </form>
    </div>
  )
}
