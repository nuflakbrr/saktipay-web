import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const role = request.cookies.get("user_role")?.value;
  const loggedIn = request.cookies.get("is_logged_in")?.value === "true";

  const isAuthPage = path === "/";
  const isDashboard = path.startsWith("/dashboard");

  // Auth page
  if (isAuthPage) {
    if (loggedIn && role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected (dashboard)
  if (isDashboard) {
    if (!loggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
