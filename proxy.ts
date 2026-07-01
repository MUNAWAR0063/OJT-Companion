import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { AUTH_ACCESS_TOKEN_COOKIE } from "@/lib/auth/session-cookie.mjs"
import { isProtectedRoute, isPublicAuthRoute, loginRedirectPath } from "@/lib/auth/auth-route-policy.mjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function hasValidSupabaseSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value
  if (!token || !supabaseUrl || !supabaseKey) return false

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  const { data, error } = await supabase.auth.getUser(token)
  const user = data.user
  return !error && Boolean(user) && !(user as { is_anonymous?: boolean }).is_anonymous
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isAuthenticated = await hasValidSupabaseSession(request)

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const url = request.nextUrl.clone()
    const redirectPath = loginRedirectPath(pathname, search)
    url.pathname = redirectPath.split("?")[0]
    url.search = redirectPath.includes("?") ? `?${redirectPath.split("?")[1]}` : ""
    return NextResponse.redirect(url)
  }

  if (isPublicAuthRoute(pathname) && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/competencies/:path*",
    "/analytics/:path*",
    "/calendar/:path*",
    "/team/:path*",
    "/tasks/:path*",
    "/equipment/:path*",
    "/documents/:path*",
    "/standards/:path*",
    "/gallery/:path*",
    "/reports/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/help/:path*",
    "/learning/:path*",
    "/weekly-planner/:path*",
    "/engineering/:path*",
    "/logout/:path*",
    "/profile/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
}
