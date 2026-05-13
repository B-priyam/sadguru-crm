import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Always allow public routes
  const isPublicRoute = pathname === "/login" || pathname === "/register";

  // ❌ No token → force login (for all protected routes)
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists, verify it
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      // Invalid token → remove access and redirect
      const response = NextResponse.redirect(new URL("/login", request.url));

      response.cookies.set("token", "", {
        expires: new Date(0),
      });

      return response;
    }
  }

  // Optional: prevent logged-in users from seeing login/register
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/:path", "/dashboard/:path*", "/login", "/register"],
};
