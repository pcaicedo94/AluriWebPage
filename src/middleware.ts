import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 1. Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Si no está logueado y quiere entrar al dashboard, mandar al login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. CONTROL DE ROLES (Aquí evitamos la confusión)
  if (user) {
    // Obtenemos el rol desde los metadatos del usuario
    // (Asegúrate de guardar el rol en user_metadata al registrarse)
    const role = user.user_metadata.role || 'investor';

    // REGLA: El Admin NO debe estar en rutas de Inversionista
    if (role === 'admin' && request.nextUrl.pathname.startsWith('/dashboard/inversionista')) {
       return NextResponse.redirect(new URL('/dashboard/admin/colocaciones', request.url))
    }

    // REGLA: El Inversionista NO debe estar en rutas de Admin
    if (role !== 'admin' && request.nextUrl.pathname.startsWith('/dashboard/admin')) {
       return NextResponse.redirect(new URL('/dashboard/inversionista', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    // Excluir archivos estáticos e imágenes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
