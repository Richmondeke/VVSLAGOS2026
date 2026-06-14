import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const lowercasePath = url.pathname.toLowerCase();
  
  // If the path contains uppercase letters, redirect to the lowercase version
  if (lowercasePath !== url.pathname) {
    url.pathname = lowercasePath;
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api) and static files
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images|.*\\..*).*)',
  ],
};
