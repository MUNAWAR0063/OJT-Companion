import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProtectionPolicyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center bg-background px-4 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">Protection Policy</h1>
      <p className="mt-4 text-muted-foreground">
        Authentication, privacy, and terms are prepared for Supabase-backed account management. Local workspace data remains scoped to authenticated users.
      </p>
      <div className="mt-8">
        <Button asChild variant="outline" className="bg-transparent"><Link href="/">Back Home</Link></Button>
      </div>
    </main>
  )
}
