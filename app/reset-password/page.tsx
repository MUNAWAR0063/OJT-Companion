"use client"

import { type FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { validateNewPassword } from "@/lib/auth/password-reset-validation.mjs"
import { LOGIN_URL, PASSWORD_RECOVERY_SESSION_KEY } from "@/lib/auth/auth-urls"
import { clearSupabaseSessionCookie } from "@/lib/auth/session-cookie.mjs"

function recoveryLinkError() {
  if (typeof window === "undefined") return ""
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
  const queryParams = new URLSearchParams(window.location.search)
  const description = hashParams.get("error_description") || queryParams.get("error_description")
  const error = hashParams.get("error") || queryParams.get("error")
  if (!description && !error) return ""
  return description || "Reset link is invalid or expired. Request a new reset link."
}

function readableResetError(error: unknown) {
  const message = error instanceof Error ? error.message : "Password could not be updated"
  const lower = message.toLowerCase()
  if (lower.includes("session") || lower.includes("expired") || lower.includes("invalid")) {
    return "Reset link is expired or invalid. Request a new reset link."
  }
  return message
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingLink, setCheckingLink] = useState(true)
  const [recoveryReady, setRecoveryReady] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let mounted = true

    const linkError = recoveryLinkError()
    if (linkError) {
      setError("Reset link is expired or invalid. Request a new reset link.")
      setCheckingLink(false)
      return
    }

    if (!supabase) {
      setError("Password reset is not available because Supabase is not configured.")
      setCheckingLink(false)
      return
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && mounted) {
        window.sessionStorage.setItem(PASSWORD_RECOVERY_SESSION_KEY, "true")
        setRecoveryReady(true)
        setError("")
        setCheckingLink(false)
      }
    })

    void supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!mounted) return
        if (sessionError) throw sessionError
        const recoveryAuthorized =
          window.sessionStorage.getItem(PASSWORD_RECOVERY_SESSION_KEY) === "true"
        if (data.session && recoveryAuthorized) {
          setRecoveryReady(true)
          setError("")
        } else {
          setError("Open the reset link from your email before setting a new password.")
        }
      })
      .catch((sessionError) => {
        if (!mounted) return
        setError(readableResetError(sessionError))
      })
      .finally(() => {
        if (mounted) setCheckingLink(false)
      })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const statusMessage = useMemo(() => {
    if (checkingLink) return "Checking reset link..."
    if (success) return "Password berhasil diperbarui. Silakan login kembali."
    if (recoveryReady) return "Enter a new password for your account."
    return "Request a new reset link if this page was opened directly or the link expired."
  }, [checkingLink, recoveryReady, success])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess(false)

    const validationError = validateNewPassword(newPassword, confirmPassword)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!supabase) {
      setError("Password reset is not available because Supabase is not configured.")
      return
    }

    if (!recoveryReady) {
      setError("Reset link is expired or invalid. Request a new reset link.")
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError

      await supabase.auth.signOut({ scope: "local" })
      clearSupabaseSessionCookie()
      window.sessionStorage.removeItem(PASSWORD_RECOVERY_SESSION_KEY)
      setSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
      window.setTimeout(() => {
        window.location.replace(LOGIN_URL)
      }, 1200)
    } catch (updateError) {
      setError(readableResetError(updateError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <p className="text-sm text-muted-foreground">{statusMessage}</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                disabled={checkingLink || success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                disabled={checkingLink || success}
              />
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            {success && (
              <p className="flex items-start gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Password berhasil diperbarui. Silakan login kembali.
              </p>
            )}

            <Button className="w-full" disabled={loading || checkingLink || !recoveryReady || success}>
              {(loading || checkingLink) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href={success ? LOGIN_URL : "/forgot-password"}>
                {success ? "Back to Login" : "Request New Link"}
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
