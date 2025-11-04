import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function Page() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to home if already logged in
    if (!loading && user) {
      router.push("/")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    )
  }

  // Don't render login form if user is authenticated
  if (user) {
    return null
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
