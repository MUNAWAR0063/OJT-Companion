export const AUTH_ENTRY_ROUTES = [
  "/login",
  "/register",
  "/signup",
  "/create-account",
  "/auth/signup",
  "/forgot-password",
]

export const PUBLIC_AUTH_ROUTES = [
  ...AUTH_ENTRY_ROUTES,
  "/reset-password",
  "/auth/callback",
  "/auth/confirm",
]

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/competencies",
  "/analytics",
  "/calendar",
  "/team",
  "/tasks",
  "/equipment",
  "/documents",
  "/standards",
  "/gallery",
  "/reports",
  "/notifications",
  "/settings",
  "/help",
  "/learning",
  "/weekly-planner",
  "/engineering",
  "/logout",
  "/profile",
]

export function isPublicAuthRoute(pathname) {
  return PUBLIC_AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function isAuthEntryRoute(pathname) {
  return AUTH_ENTRY_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function isProtectedRoute(pathname) {
  return PROTECTED_ROUTE_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function loginRedirectPath(pathname, search = "") {
  const next = `${pathname}${search}`
  return `/login?next=${encodeURIComponent(next)}`
}

export function safeLoginDestination(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/dashboard"
  }

  const pathname = value.split(/[?#]/, 1)[0]
  return isPublicAuthRoute(pathname) ? "/dashboard" : value
}

export function authRouteRedirect(pathname, search, isAuthenticated) {
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    return loginRedirectPath(pathname, search)
  }
  if (isAuthEntryRoute(pathname) && isAuthenticated) {
    return "/dashboard"
  }
  return null
}
