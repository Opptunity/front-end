"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface UserData {
  id: string
  username: string
  email: string
  role: string
  jobTitle?: string
  // Add other fields as needed
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Only check auth on client-side to avoid SSR issues
  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/auth/verify']
    
    // Dont check auth on public routes
    if (publicRoutes.some(route => pathname?.startsWith(route))) {
      setLoading(false)
      return
    }
    
    const checkAuth = async () => {
      try {
        const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        
        if (!authToken) {
          setIsAuthenticated(false)
          setLoading(false)
          return
        }
        
        // Check if API URL is configured
        const apiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || '/api'
        
        // Fetch user profile data from API
        const response = await fetch(`${apiUrl}/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }
        
        const userData = await response.json()
        setUser(userData)
        setIsAuthenticated(true)
      } catch (err) {
        console.error("Auth error:", err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setIsAuthenticated(false)
        
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
        }
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [pathname])
  
  const login = async (email: string) => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || '/api'
      
      const response = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      // The actual login completes when the magic link is used
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error during login')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
