"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const auth = useAuth()
  const { isBackendAuthenticated, isLoading: isBackendLoading } = useBackendAuth()
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    // Only perform the auth check once when the component mounts
    // or when auth state actually changes, not on route navigation
    if (hasCheckedAuth) {
      return
    }

    // Only proceed when both auth states are settled
    if (!auth.loading && !isBackendLoading) {
      if (!auth.user) {
        // Not authenticated with WorkOS, redirect to login
        router.push("/login")
      } else if (!isBackendAuthenticated) {
        // Authenticated with WorkOS but not with backend
        // This should be rare due to our caching improvements
        console.log("Authenticated with WorkOS but not with backend yet")
      }
      
      // Mark that we've checked auth status
      setHasCheckedAuth(true)
      setLoading(false)
    }
  }, [auth.user, auth.loading, isBackendAuthenticated, isBackendLoading, hasCheckedAuth, router])
  
  // Simple loading state for the initial auth check
  if (loading && !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return <>{children}</>
} 