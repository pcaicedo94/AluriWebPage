'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function crearUsuario(formData: FormData) {
  // Create admin client inside function to avoid module-level errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: 'Configuracion del servidor incompleta. Contacta al administrador.' }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  if (!email || !password || !fullName || !role) {
    return { error: 'Todos los campos son requeridos' }
  }

  const validRoles = ['inversionista', 'propietario', 'admin']
  if (!validRoles.includes(role)) {
    return { error: 'Rol invalido' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  // 1. Create user in Auth system (without trigger metadata to avoid trigger issues)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  })

  if (error) {
    console.error('Error creating auth user:', error.message)
    return { error: error.message }
  }

  // 2. Create profile directly (in case trigger fails or doesn't exist)
  // First check if profile was created by trigger
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .single()

  if (!existingProfile) {
    // Profile wasn't created by trigger, create it manually
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: role
      })

    if (profileError) {
      console.error('Error creating profile:', profileError.message)
      // User was created but profile failed - try to clean up
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      return { error: 'Error al crear perfil: ' + profileError.message }
    }
  } else {
    // Profile exists (created by trigger), update the role
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role, full_name: fullName })
      .eq('id', data.user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError.message)
      return { error: 'Error al actualizar rol: ' + updateError.message }
    }
  }

  // Revalidate the users page to show the new user
  revalidatePath('/dashboard/admin/usuarios')

  return { success: true, userId: data.user.id }
}
