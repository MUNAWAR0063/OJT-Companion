export const PRODUCTION_SITE_URL = "https://ojt-companion.vercel.app"

export function normalizeSiteUrl(value) {
  const url = typeof value === "string" && value.trim() ? value.trim() : PRODUCTION_SITE_URL
  return url.replace(/\/+$/, "")
}

export function safeAuthNext(value, fallback = "/dashboard") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback
  }
  return value
}

export function buildAuthCallbackUrl(siteUrl, next, flow) {
  const url = new URL("/auth/callback", normalizeSiteUrl(siteUrl))
  url.searchParams.set("next", safeAuthNext(next))
  url.searchParams.set("flow", flow)
  return url.toString()
}
