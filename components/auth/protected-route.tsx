"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth/auth-store"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const status = useAuthStore((state) => state.status)
  const isRestoring = useAuthStore((state) => state.isRestoring)

  useEffect(() => {
    if (!isRestoring && status !== "authenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [isRestoring, pathname, router, status])

  if (isRestoring || status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Verifying workspace access
        </div>
      </div>
    )
  }

  return <>{children}</>
}
