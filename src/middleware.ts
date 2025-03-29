import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect routes and redirect authenticated users
 */
export async function middleware(req: NextRequest) {
  // Get the pathname of the request
  const path = req.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/login' || path === '/register';

  // Check if the path is for an API route
  const isApiPath = path.startsWith('/api');

  // Check if the path is a dashboard route
  const isDashboardPath = path.startsWith('/dashboard');

  // Get the token from cookies
  const token = req.cookies.get('access_token')?.value;

  // If the path is a public path and the user is authenticated, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If the path is NOT a public path and NOT an API path and the user is NOT authenticated,
  // redirect to login page
  if (!isPublicPath && !isApiPath && !token) {
    // Save the original URL to redirect back after login
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // Always allow authenticated requests to pass through
  return NextResponse.next();
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
