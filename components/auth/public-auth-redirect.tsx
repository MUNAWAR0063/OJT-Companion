"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth/auth-store"

export function PublicAuthRedirect({ children }: { children: ReactNode }) {
  const router = useRouter()
  const status = useAuthStore((state) => state.status)
  const isRestoring = useAuthStore((state) => state.isRestoring)

  useEffect(() => {
    if (!isRestoring && status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [isRestoring, router, status])

  return <>{children}</>
}
