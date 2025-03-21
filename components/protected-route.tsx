"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken')
    
    if (!authToken) {
      // Redirect to login if not authenticated
      router.push("/login")
      return
    }
    
    // Verify token validity with backend
    const verifyToken = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error("Invalid authentication")
        }
        
        setIsAuthenticated(true)
        setLoading(false)
      } catch (error) {
        console.error("Authentication error:", error)
        localStorage.removeItem('authToken')
        router.push("/login")
      }
    }
    
    verifyToken()
  }, [router])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return isAuthenticated ? <>{children}</> : null
} 