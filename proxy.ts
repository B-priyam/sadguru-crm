import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Routes that don't require authentication
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/api/webhooks/facebook";

  // Never protect PWA/static resources
  const isPWAResource =
    pathname === "/manifest.webmanifest" ||
    pathname === "/sd-logo-192.png" ||
    pathname === "/sd-logo-512.png" ||
    pathname === "/favicon.ico";

  const isNextResource = pathname.startsWith("/_next/");

  // Always allow public/PWA/Next.js resources
  if (isPublicRoute || isPWAResource || isNextResource) {
    return NextResponse.next();
  }

  // No token → login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.set("token", "", {
      expires: new Date(0),
      path: "/",
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/forgot-password",
    "/api/webhooks/facebook",
  ],
};
