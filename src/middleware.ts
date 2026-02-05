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

  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()

  // Si no está logueado y quiere entrar al dashboard, mandar al login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si está logueado, verificar el rol y redirigir al dashboard apropiado
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      const currentPath = request.nextUrl.pathname
      
      // Si es propietario y no está en su dashboard, redirigir
      if (profile.role === 'propietario' && !currentPath.startsWith('/dashboard/propietario')) {
        return NextResponse.redirect(new URL('/dashboard/propietario', request.url))
      }
      
      // Si es inversionista y no está en su dashboard, redirigir
      if (profile.role === 'inversionista' && !currentPath.startsWith('/dashboard/inversionista')) {
        return NextResponse.redirect(new URL('/dashboard/inversionista', request.url))
      }
      
      // Si es admin y no está en su dashboard, redirigir
      if (profile.role === 'admin' && !currentPath.startsWith('/dashboard/admin')) {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      }
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
