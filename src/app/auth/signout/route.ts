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
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Handle cookie setting in edge cases
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Handle cookie removal in edge cases
          }
        },
      },
    }
  )

  // Sign out the user
  await supabase.auth.signOut()

  // Create response that redirects to login
  const response = NextResponse.redirect(new URL('/login', request.url), {
    status: 302,
  })

  // Clear all Supabase auth cookies
  const allCookies = cookieStore.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.set(cookie.name, '', {
        expires: new Date(0),
        path: '/',
      })
    }
  }

  return response
}
