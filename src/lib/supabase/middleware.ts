import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Define protected route patterns
  const protectedPatterns = ['/dashboard', '/profile', '/appointments', '/waitlist', '/callbacks', '/virtual-consult', '/notifications']
  const clinicPatterns = ['/clinic-dashboard', '/clinic-appointments', '/clinic-practitioners', '/clinic-services', '/clinic-queue', '/clinic-callbacks', '/clinic-settings', '/clinic-virtual-consult']
  const adminPatterns = ['/admin']
  const authPatterns = ['/login', '/signup', '/forgot-password']

  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users from protected routes
  if (!user && [...protectedPatterns, ...clinicPatterns, ...adminPatterns].some(p => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && authPatterns.some(p => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
