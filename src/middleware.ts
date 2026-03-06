import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (true) {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
    if (
      request.nextUrl.pathname.startsWith("/shops") ||
      request.nextUrl.pathname.startsWith("/digital")
    ) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/shops", "/digital"],
};
