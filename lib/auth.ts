import { cookies } from 'next/headers'

// Define types for user and session
interface User {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  username?: string
}

interface Session {
  user: User
}

/**
 * Get the current authenticated session 
 */
export async function getSession(): Promise<Session | null> {
  try {
    // Check for custom backend auth from cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')
    
    if (token?.value) {
      // Make a request to validate the token and get user info
      // This is a placeholder - implement actual token validation logic
      try {
        const response = await fetch('/api/auth/validate', {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          return {
            user: {
              id: userData.id,
              email: userData.email,
              username: userData.username
            }
          }
        }
      } catch (error) {
        console.error('Error validating auth token:', error)
      }
    }
    
    // For development, return a mock session
    // Remove in production
    return {
      user: {
        id: 'mock-user-id',
        email: 'user@example.com',
        username: 'DemoUser'
      }
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
} 