import { PublicAuthRedirect } from "@/components/auth/public-auth-redirect"
import { LandingLoginPage } from "@/components/LandingLoginPage"

export default function LoginPage() {
  return (
    <PublicAuthRedirect>
      <LandingLoginPage />
    </PublicAuthRedirect>
  )
}
