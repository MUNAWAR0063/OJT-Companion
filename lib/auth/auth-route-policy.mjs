export const PUBLIC_AUTH_ROUTES = ["/login", "/register", "/forgot-password"]

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

export function isProtectedRoute(pathname) {
  return PROTECTED_ROUTE_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function loginRedirectPath(pathname, search = "") {
  const next = `${pathname}${search}`
  return `/login?next=${encodeURIComponent(next)}`
}
