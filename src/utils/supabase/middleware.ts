import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create client with simple cookie handling for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect routes
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/register') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        // Allow public access to landing page
        request.nextUrl.pathname !== '/' &&
        // Allow public access to public API routes if needed, but here we generally protect
        !request.nextUrl.pathname.startsWith('/api/public') &&
        // Static assets
        !request.nextUrl.pathname.startsWith('/_next') &&
        !request.nextUrl.pathname.startsWith('/favicon.ico')
    ) {
        // Check if path is protected (everything else is protected by default in this logic)
        // Actually, let's invert: Only protect /dashboard, /onboarding, etc.
        // Or protect everything and allow-list. 
        // The user requested "MAINTAIN SIGNED IN STATUS THROUGHOUT THE SITE", which implies protection.
        // But Landing Page is public.
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Force onboarding if logged in but maybe not completed? 
    // For now, let's just protect /dashboard and /onboarding

    return supabaseResponse
}
