import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "rahasia_banget_2025"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes yang bisa diakses tanpa login
  const publicRoutes = [
    "/login", 
    "/register", 
    "/api/auth/login", 
    "/api/auth/register",
    "/uploads",
    "/api/user/products", // User bisa lihat produk tanpa login
    "/api/user/cart/count", // Untuk cart badge polling
  ];
  
  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/public")) {
    return NextResponse.next();
  }

  // Cek token untuk protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token, secretKey);
    
    // Role-based access control
    if (pathname.startsWith("/admin")) {
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/user", request.url));
      }
    }

    if (pathname.startsWith("/user")) {
      if (payload.role !== "USER") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    // Allow API routes based on role
    if (pathname.startsWith("/api/admin")) {
      if (payload.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    if (pathname.startsWith("/api/user")) {
      if (payload.role !== "USER") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Token invalid, redirect ke login
    console.error("Middleware auth error:", error);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session_token");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};