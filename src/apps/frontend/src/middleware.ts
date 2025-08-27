import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const buyerName = req.cookies.get("buyerName")?.value;
  const url = req.nextUrl.clone();

  // Root: redirect based on auth status
  if (url.pathname === "/") {
    url.pathname = buyerName && buyerName.length > 0 ? "/sales" : "/login";
    return NextResponse.redirect(url);
  }

  // Guest-only: redirect authenticated users away from /login
  if (url.pathname === "/login") {
    if (buyerName && buyerName.length > 0) {
      url.pathname = "/sales";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protected routes: /sales and below
  if (
    url.pathname.startsWith("/sales") ||
    url.pathname.startsWith("/payment") ||
    url.pathname.startsWith("/waiting")
  ) {
    if (!buyerName) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/sales/:path*", "/payment", "/waiting"],
};
