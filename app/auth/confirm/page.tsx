"use client"

import { useEffect, useState } from "react"
import type { EmailOtpType } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EMAIL_VERIFICATION_LOGIN_URL } from "@/lib/auth/email-verification"
import { clearSupabaseSessionCookie } from "@/lib/auth/session-cookie.mjs"
import { supabase } from "@/lib/supabase/client"

const EMAIL_VERIFICATION_TYPES = new Set<EmailOtpType>(["signup", "email"])

function callbackParameters() {
  const query = new URLSearchParams(window.location.search)
  const fragment = new URLSearchParams(window.location.hash.slice(1))

  return {
    code: query.get("code"),
    error: query.get("error_description") ?? fragment.get("error_description"),
    hasImplicitSession: fragment.has("access_token"),
    tokenHash: query.get("token_hash"),
    type: query.get("type"),
  }
}

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<"verifying" | "redirecting" | "error">("verifying")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function confirmEmail() {
      if (!supabase) {
        throw new Error("Authentication service is not configured.")
      }

      const parameters = callbackParameters()
      if (parameters.error) throw new Error(parameters.error)

      if (parameters.tokenHash) {
        if (!parameters.type || !EMAIL_VERIFICATION_TYPES.has(parameters.type as EmailOtpType)) {
          throw new Error("This email verification link is invalid.")
        }

        const { error: verificationError } = await supabase.auth.verifyOtp({
          token_hash: parameters.tokenHash,
          type: parameters.type as EmailOtpType,
        })
        if (verificationError) throw verificationError
      } else if (parameters.code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(parameters.code)
        if (exchangeError) throw exchangeError
      } else if (!parameters.hasImplicitSession) {
        throw new Error("This email verification link is invalid or has expired.")
      }

      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!data.session?.user.email_confirmed_at) {
        throw new Error("Email verification could not be confirmed. The link may be invalid or expired.")
      }

      // Verification links may create a temporary session. Clear only that browser
      // session so the user reaches the requested login flow instead of being
      // redirected as an already-authenticated user.
      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" })
      clearSupabaseSessionCookie()
      if (signOutError) throw signOutError

      if (!active) return
      setStatus("redirecting")
      window.location.replace(EMAIL_VERIFICATION_LOGIN_URL)
    }

    void confirmEmail().catch((verificationError: unknown) => {
      if (!active) return
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Email verification failed. The link may be invalid or expired."
      )
      setStatus("error")
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === "error" ? "Email verification failed" : "Verifying your email"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "verifying" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Please wait while we verify your email.
            </p>
          )}
          {status === "redirecting" && (
            <p className="text-sm text-muted-foreground">
              Email verified. Redirecting you to sign in.
            </p>
          )}
          {status === "error" && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {status !== "verifying" && (
            <Button asChild className="w-full">
              <a href={EMAIL_VERIFICATION_LOGIN_URL}>Continue to login</a>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
