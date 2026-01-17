import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Verificamos si hay sesión y obtenemos el rol antes de cerrar
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let redirectPath = '/login/inversionista' // default

  if (session) {
    // Obtenemos el rol del usuario antes de cerrar sesión
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Determinamos a qué login redirigir según el rol
    if (profile?.role === 'propietario') {
      redirectPath = '/login/propietario'
    }

    await supabase.auth.signOut()
  }

  // Redirigir al login correspondiente después de salir
  return NextResponse.redirect(new URL(redirectPath, request.url), {
    status: 302,
  })
}
