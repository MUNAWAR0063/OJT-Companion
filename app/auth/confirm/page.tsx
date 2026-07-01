import {
  AuthCallback,
  LEGACY_EMAIL_CONFIRMATION_DEFAULTS,
} from "@/components/auth/auth-callback"

export default function LegacyEmailConfirmationPage() {
  return <AuthCallback {...LEGACY_EMAIL_CONFIRMATION_DEFAULTS} />
}
