"use client"

import { useState, useEffect } from 'react'

interface UserData {
  id: string
  username: string
  email: string
  role: string
  jobTitle?: string
  // Add other fields as needed
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Function to handle localStorage access safely (for SSR)
    const getAuthToken = () => {
      try {
        return typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      } catch (e) {
        return null
      }
    }

    const fetchUserData = async () => {
      try {
        const authToken = getAuthToken()
        
        if (!authToken) {
          setUser(null)
          setLoading(false)
          return
        }
        
        // Check if API URL is configured
        const apiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || '/api';
        
        // Fetch user profile data from API
        const response = await fetch(`${apiUrl}/api/users/profile`, {
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
        console.log("User data from API:", userData) // Debug log
        
        // Set user data
        setUser(userData)
      } catch (err) {
        console.error("Auth error:", err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
        }
        
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [])
  
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
    setUser(null)
  }
  
  return { user, loading, error, logout }
} 