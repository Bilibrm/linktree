import { auth } from "@/lib/auth"
import type { NextRequest } from "next/server"
import type { Session } from "next-auth"

interface ProxyAuthRequest extends NextRequest {
  auth: Session | null
}

function proxyHandler(req: ProxyAuthRequest) {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnAuth = req.nextUrl.pathname.startsWith("/auth")

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", req.nextUrl))
  }

  if (isOnAuth && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
}

export const proxy = auth(proxyHandler)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
}
