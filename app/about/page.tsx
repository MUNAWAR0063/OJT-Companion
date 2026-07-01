import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center bg-background px-4 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">About OJT Companion</h1>
      <p className="mt-4 text-muted-foreground">
        OJT Companion is a digital workspace for apprentices to plan learning, document engineering work, track competencies, and prepare reports.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild><Link href="/register">Create Account</Link></Button>
        <Button asChild variant="outline" className="bg-transparent"><Link href="/">Back Home</Link></Button>
      </div>
    </main>
  )
}
