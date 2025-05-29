"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  
  // Check if we're in a logout transition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthTransitioning = window.sessionStorage.getItem('auth_transitioning') === 'true';
      if (isAuthTransitioning) {
        console.log("Auth is in transitioning state (logout in progress)");
        setAuthError(true);
        
        // Clear the flag after a short delay
        setTimeout(() => {
          window.sessionStorage.removeItem('auth_transitioning');
        }, 5000);
      }
    }
  }, []);
  
  // Wrap auth hooks in try/catch to handle transition states during logout
  let auth, isBackendAuthenticated, isBackendLoading;
  try {
    const authResult = useAuth();
    auth = authResult;
    
    const backendAuthResult = useBackendAuth();
    isBackendAuthenticated = backendAuthResult.isBackendAuthenticated;
    isBackendLoading = backendAuthResult.isLoading;
  } catch (error) {
    console.error("Auth error in ProtectedRoute:", error);
    setAuthError(true);
    auth = { loading: false, user: null };
    isBackendAuthenticated = false;
    isBackendLoading = false;
  }
  
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    // Handle auth transition errors
    if (authError) {
      // If we hit an auth error, redirect to login after a short delay
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/sso?fresh=true';
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
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
  }, [auth?.user, auth?.loading, isBackendAuthenticated, isBackendLoading, hasCheckedAuth, router, authError])
  
  // Show error state if we encountered auth transition issues
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Session Expired</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your session has ended or encountered an issue. Redirecting you to login...
          </p>
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }
  
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