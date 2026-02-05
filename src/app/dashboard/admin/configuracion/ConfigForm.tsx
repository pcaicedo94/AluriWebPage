'use client'

import { useState, useRef } from 'react'
import { User, Lock, Camera, Check, X, Loader2 } from 'lucide-react'
import { updateProfile, changePassword, uploadAvatar } from './actions'

interface ConfigFormProps {
  initialData: {
    full_name: string | null
    email: string | null
    avatar_url: string | null
    role: string | null
  }
}

export default function ConfigForm({ initialData }: ConfigFormProps) {
  // Profile state
  const [fullName, setFullName] = useState(initialData.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || '')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [avatarMessage, setAvatarMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage(null)

    const formData = new FormData()
    formData.append('fullName', fullName)

    const result = await updateProfile(formData)

    if (result.error) {
      setProfileMessage({ type: 'error', text: result.error })
    } else {
      setProfileMessage({ type: 'success', text: result.message || 'Actualizado' })
    }

    setProfileLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    const formData = new FormData()
    formData.append('currentPassword', currentPassword)
    formData.append('newPassword', newPassword)
    formData.append('confirmPassword', confirmPassword)

    const result = await changePassword(formData)

    if (result.error) {
      setPasswordMessage({ type: 'error', text: result.error })
    } else {
      setPasswordMessage({ type: 'success', text: result.message || 'Actualizado' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setPasswordLoading(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarLoading(true)
    setAvatarMessage(null)

    const formData = new FormData()
    formData.append('avatar', file)

    const result = await uploadAvatar(formData)

    if (result.error) {
      setAvatarMessage({ type: 'error', text: result.error })
    } else {
      setAvatarMessage({ type: 'success', text: result.message || 'Actualizado' })
      if (result.avatarUrl) {
        setAvatarUrl(result.avatarUrl)
      }
    }

    setAvatarLoading(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-8">
      {/* Foto de Perfil */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <Camera size={20} className="text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Foto de Perfil</h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={40} className="text-slate-500" />
                </div>
              )}
            </div>
            {avatarLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 size={24} className="text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-input"
            />
            <label
              htmlFor="avatar-input"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl cursor-pointer transition-colors"
            >
              <Camera size={16} />
              Cambiar foto
            </label>
            <p className="text-xs text-slate-500">JPG, PNG o WebP. Max 2MB.</p>

            {avatarMessage && (
              <div className={`flex items-center gap-2 text-sm ${avatarMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {avatarMessage.type === 'success' ? <Check size={14} /> : <X size={14} />}
                {avatarMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informacion Personal */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <User size={20} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Informacion Personal</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Correo electronico
            </label>
            <input
              type="email"
              value={initialData.email || ''}
              disabled
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">El correo no se puede cambiar</p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Rol
            </label>
            <input
              type="text"
              value={initialData.role || ''}
              disabled
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-400 cursor-not-allowed capitalize"
            />
          </div>

          {profileMessage && (
            <div className={`flex items-center gap-2 text-sm ${profileMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {profileMessage.type === 'success' ? <Check size={14} /> : <X size={14} />}
              {profileMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-semibold rounded-xl transition-colors"
          >
            {profileLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </form>
      </div>

      {/* Cambiar Contraseña */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <Lock size={20} className="text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Cambiar Contraseña</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Contraseña actual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-500 mt-1">Minimo 6 caracteres</p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {passwordMessage && (
            <div className={`flex items-center gap-2 text-sm ${passwordMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {passwordMessage.type === 'success' ? <Check size={14} /> : <X size={14} />}
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black font-semibold rounded-xl transition-colors"
          >
            {passwordLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Actualizando...
              </>
            ) : (
              'Cambiar contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
