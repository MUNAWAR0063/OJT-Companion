"use client"

import { useEffect, useRef, useState } from "react"
import type { EmailOtpType } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  EMAIL_VERIFICATION_LOGIN_PATH,
  EMAIL_VERIFICATION_LOGIN_URL,
  LOGIN_URL,
  PASSWORD_RECOVERY_SESSION_KEY,
  SITE_URL,
} from "@/lib/auth/auth-urls"
import { safeAuthNext } from "@/lib/auth/auth-url.mjs"
import { clearSupabaseSessionCookie } from "@/lib/auth/session-cookie.mjs"
import { supabase } from "@/lib/supabase/client"

type AuthCallbackFlow = "generic" | "recovery" | "verification"

const EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
])

function readableCallbackError(error: unknown) {
  const message = error instanceof Error ? error.message : ""
  const normalized = message.toLowerCase()
  if (
    normalized.includes("expired") ||
    normalized.includes("invalid") ||
    normalized.includes("token")
  ) {
    return "This authentication link is invalid or has expired. Request a new link and try again."
  }
  return "The authentication link could not be verified. Request a new link and try again."
}

function callbackParameters(defaultFlow: AuthCallbackFlow, defaultNext: string) {
  const query = new URLSearchParams(window.location.search)
  const fragment = new URLSearchParams(window.location.hash.slice(1))
  const requestedFlow = query.get("flow")
  const flow: AuthCallbackFlow =
    requestedFlow === "verification" || requestedFlow === "recovery"
      ? requestedFlow
      : defaultFlow

  return {
    code: query.get("code"),
    error: query.get("error_description") ?? fragment.get("error_description"),
    flow,
    hasImplicitSession: fragment.has("access_token"),
    next: safeAuthNext(query.get("next"), defaultNext),
    tokenHash: query.get("token_hash"),
    type: query.get("type"),
  }
}

export function AuthCallback({
  defaultFlow = "generic",
  defaultNext = "/dashboard",
}: {
  defaultFlow?: AuthCallbackFlow
  defaultNext?: string
}) {
  const [status, setStatus] = useState<"processing" | "redirecting" | "error">("processing")
  const [error, setError] = useState("")
  const [fallbackUrl, setFallbackUrl] = useState(LOGIN_URL)
  const callbackRun = useRef<{ key: string; promise: Promise<string> } | null>(null)
  const effectGeneration = useRef(0)

  useEffect(() => {
    const generation = ++effectGeneration.current
    const parameters = callbackParameters(defaultFlow, defaultNext)
    const runKey = `${window.location.href}|${defaultFlow}|${defaultNext}`

    setFallbackUrl(
      parameters.flow === "verification"
        ? EMAIL_VERIFICATION_LOGIN_URL
        : parameters.flow === "recovery"
          ? `${SITE_URL}/forgot-password`
          : LOGIN_URL
    )

    async function processCallback(): Promise<string> {
      if (!supabase) throw new Error("Authentication service is not configured.")

      if (parameters.error) throw new Error(parameters.error)

      if (parameters.tokenHash) {
        if (!parameters.type || !EMAIL_OTP_TYPES.has(parameters.type as EmailOtpType)) {
          throw new Error("Invalid authentication link type.")
        }
        if (parameters.flow === "recovery" && parameters.type !== "recovery") {
          throw new Error("Invalid password recovery link.")
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
        throw new Error("Authentication code is missing.")
      }

      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!data.session?.user) throw new Error("Authentication session could not be created.")

      if (parameters.flow === "verification") {
        if (!data.session.user.email_confirmed_at) {
          throw new Error("Email verification could not be confirmed.")
        }

        const { error: signOutError } = await supabase.auth.signOut({ scope: "local" })
        clearSupabaseSessionCookie()
        if (signOutError) throw signOutError
      } else if (parameters.flow === "recovery") {
        window.sessionStorage.setItem(PASSWORD_RECOVERY_SESSION_KEY, "true")
      }

      return `${SITE_URL}${parameters.next}`
    }

    if (!callbackRun.current || callbackRun.current.key !== runKey) {
      callbackRun.current = { key: runKey, promise: processCallback() }
    }

    void callbackRun.current.promise
      .then((destination) => {
        if (effectGeneration.current !== generation) return
        setStatus("redirecting")
        window.location.replace(destination)
      })
      .catch((callbackError: unknown) => {
        if (effectGeneration.current !== generation) return
        setError(readableCallbackError(callbackError))
        setStatus("error")
      })

    return () => {
      if (effectGeneration.current === generation) effectGeneration.current += 1
    }
  }, [defaultFlow, defaultNext])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === "error" ? "Authentication link failed" : "Confirming your request"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "processing" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Please wait while we verify this secure link.
            </p>
          )}
          {status === "redirecting" && (
            <p className="text-sm text-muted-foreground">
              Link confirmed. Redirecting you to the next step.
            </p>
          )}
          {status === "error" && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {status !== "processing" && (
            <Button asChild className="w-full">
              <a href={fallbackUrl}>Continue</a>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export const LEGACY_EMAIL_CONFIRMATION_DEFAULTS = {
  defaultFlow: "verification" as const,
  defaultNext: EMAIL_VERIFICATION_LOGIN_PATH,
}
