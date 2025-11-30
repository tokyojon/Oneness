import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes are protected
const protectedRoutes = ['/dashboard'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For now, we'll disable the middleware authentication check
  // since Supabase uses localStorage for auth tokens, not cookies
  // The dashboard components handle authentication with ProtectedRoute
  
  // Only redirect authenticated users from auth routes to dashboard
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Simple check for session in URL (for OAuth redirects)
  const hasSessionInUrl = request.nextUrl.searchParams.has('access_token') || 
                         request.nextUrl.searchParams.has('refresh_token');

  if (isAuthRoute && hasSessionInUrl) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
