'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate inputs
  if (!email || !password) {
    return { error: 'Por favor ingresa tu correo y contraseña' }
  }

  // Attempt login
  const { error, data } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  })

  if (error) {
    return { error: 'Credenciales inválidas' }
  }

  // Fetch user role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    return { error: 'Error al verificar el perfil de usuario' }
  }

  // Success - revalidate and redirect to appropriate dashboard
  revalidatePath('/', 'layout')
  if (profile.role === 'admin') {
    redirect('/dashboard/admin/usuarios')
  } else if (profile.role === 'inversionista') {
    redirect('/dashboard/inversionista')
  } else if (profile.role === 'propietario') {
    redirect('/dashboard/propietario')
  } else {
    await supabase.auth.signOut()
    return { error: 'Rol de usuario desconocido. Contacta soporte.' }
  }
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Por favor ingresa tu correo electrónico' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: 'Error al enviar el correo de recuperación' }
  }

  return { success: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.' }
}
