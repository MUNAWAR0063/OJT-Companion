import { buildAuthCallbackUrl, normalizeSiteUrl } from "@/lib/auth/auth-url.mjs"

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
)

export const LOGIN_URL = `${SITE_URL}/login`
export const EMAIL_VERIFICATION_LOGIN_PATH = "/login?next=%2Fdashboard"
export const EMAIL_VERIFICATION_LOGIN_URL = `${SITE_URL}${EMAIL_VERIFICATION_LOGIN_PATH}`

export const EMAIL_VERIFICATION_CALLBACK_URL = buildAuthCallbackUrl(
  SITE_URL,
  EMAIL_VERIFICATION_LOGIN_PATH,
  "verification"
)

export const PASSWORD_RECOVERY_CALLBACK_URL = buildAuthCallbackUrl(
  SITE_URL,
  "/reset-password",
  "recovery"
)

export const PASSWORD_RECOVERY_SESSION_KEY = "ojt-password-recovery"
