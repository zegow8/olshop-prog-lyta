import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "rahasia_banget_2025"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    "/login",
    "/register",
    "/401",
    "/403",
    "/api/auth/login",
    "/api/auth/register",
    "/uploads",
    "/api/user/products",
    "/api/user/cart/count",
  ];

  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isUserPage = pathname.startsWith("/user");

  // ❌ belum login tapi maksa dashboard
  if ((isAdminPage || isUserPage) && !token) {
    return NextResponse.redirect(new URL("/401", request.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);

    // ❌ ADMIN maksa ke /user
    if (isUserPage && payload.role === "ADMIN") {
      return NextResponse.redirect(
        new URL("/403?role=user", request.url)
      );
    }

    // ❌ USER maksa ke /admin
    if (isAdminPage && payload.role === "USER") {
      return NextResponse.redirect(
        new URL("/403?role=admin", request.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
