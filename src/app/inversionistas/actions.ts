'use server'

import { createClient } from '../../utils/supabase/server'

export async function registrarInversionista(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const telefono = formData.get('telefono') as string
  const ciudad = formData.get('ciudad') as string
  const montoInversion = formData.get('montoInversion') as string

  // Validation
  if (!email || !password || !fullName || !telefono) {
    return { error: 'Todos los campos obligatorios son requeridos' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  // Create user with Supabase Auth (public signup)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role_request: 'inversionista',
        telefono,
        ciudad,
        monto_inversion: montoInversion
      }
    }
  })

  if (error) {
    console.error('Error registering investor:', error.message)

    if (error.message.includes('already registered')) {
      return { error: 'Este correo ya está registrado. Intenta iniciar sesión.' }
    }

    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Error al crear la cuenta. Intenta de nuevo.' }
  }

  // Check if email confirmation is required
  if (data.user.identities?.length === 0) {
    return { error: 'Este correo ya está registrado.' }
  }

  return {
    success: true,
    message: 'Cuenta creada exitosamente. Revisa tu correo para confirmar tu cuenta.',
    requiresConfirmation: !data.session
  }
}
