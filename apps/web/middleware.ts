import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }
    return NextResponse.redirect("/");
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
