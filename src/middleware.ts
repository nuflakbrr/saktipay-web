import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const role = request.cookies.get("user_role")?.value;
  const loggedIn = request.cookies.get("is_logged_in")?.value === "true";

  const isAuthPage = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isMasterData = pathname.startsWith("/master");
  const isPosPage = pathname.startsWith("/sales");

  // 1️⃣ LOGIN PAGE
  if (isAuthPage) {
    if (loggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2️⃣ PROTECTED PAGES (LOGIN REQUIRED)
  if ((isDashboard || isMasterData || isPosPage) && !loggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3️⃣ ROLE-BASED ACCESS (ADMIN ONLY)
  if (isMasterData && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/master/:path*", "/sales/:path*"],
};
