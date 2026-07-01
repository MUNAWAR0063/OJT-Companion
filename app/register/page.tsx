"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PublicAuthRedirect } from "@/components/auth/public-auth-redirect"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Discipline } from "@/lib/auth/auth-types"
import { DISCIPLINE_OPTIONS } from "@/lib/discipline/discipline-engine"
import { useAuthStore } from "@/lib/auth/auth-store"

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function RegisterPage() {
  const router = useRouter()
  const signUp = useAuthStore((state) => state.signUp)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [discipline, setDiscipline] = useState<Discipline>("Electrical Technician")
  const [company, setCompany] = useState("Medco E&P")
  const [program, setProgram] = useState("Operations Apprentice Development Program")
  const [batch, setBatch] = useState("OADP 2026")
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    if (!fullName.trim()) return setError("Full name is required")
    if (!isEmail(email)) return setError("Enter a valid email address")
    if (password.length < 8) return setError("Password must be at least 8 characters")
    if (password !== confirmPassword) return setError("Passwords do not match")
    if (!accepted) return setError("You must accept the terms")

    setLoading(true)
    try {
      await signUp({ fullName, email, password, discipline, company, program, ojtBatch: batch })
      toast.success("Account created. Check your email verification status before signing in.")
      router.replace("/login")
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "Unable to create account"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicAuthRedirect>
      <main className="min-h-screen bg-background px-4 py-10">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <p className="text-sm text-muted-foreground">Start your OJT Companion workspace.</p>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label>Discipline</Label>
                <Select value={discipline} onValueChange={(value) => setDiscipline(value as Discipline)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DISCIPLINE_OPTIONS.map((item) => <SelectItem key={item.code} value={item.label}>{item.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={company} onChange={(event) => setCompany(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input id="program" value={program} onChange={(event) => setProgram(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input id="batch" value={batch} onChange={(event) => setBatch(event.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
                <Checkbox checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} />
                Accept Terms & Conditions
              </label>
              {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive md:col-span-2">{error}</p>}
              <Button className="md:col-span-2" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Account
              </Button>
              <p className="text-center text-sm text-muted-foreground md:col-span-2">
                Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign In</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </PublicAuthRedirect>
  )
}
