export const AUTH_ACCESS_TOKEN_COOKIE = "ojt-supabase-access-token"

function isProduction() {
  return process.env.NODE_ENV === "production"
}

function cookieOptions(maxAge) {
  return [
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(maxAge))}`,
    isProduction() ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")
}

export function setSupabaseSessionCookie(session) {
  if (typeof document === "undefined") return
  const token = session?.access_token
  if (!token) return
  const expiresAtMs =
    typeof session.expires_at === "number" ? session.expires_at * 1000 : Date.now() + 60 * 60 * 1000
  const maxAge = Math.max(60, Math.floor((expiresAtMs - Date.now()) / 1000))
  document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; ${cookieOptions(maxAge)}`
}

export function clearSupabaseSessionCookie() {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE}=; ${cookieOptions(0)}`
}
