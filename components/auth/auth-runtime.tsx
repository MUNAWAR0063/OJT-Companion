"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth/auth-store"

export function AuthRuntime() {
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  return null
}
