"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { useAuthStore } from "@/lib/auth/auth-store"

export default function LogoutPage() {
  const router = useRouter()
  const signOut = useAuthStore((state) => state.signOut)

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="app-main-content flex-1 p-4 md:p-6 min-[1280px]:p-8">
        <Header title="Sign Out" description="End your current session." />

        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <Card className="p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <LogOut className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Sign Out</h1>
              <p className="text-muted-foreground">Are you sure you want to sign out of OJT Companion?</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  void signOut().then(() => router.replace("/login"))
                }}
              >
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}


