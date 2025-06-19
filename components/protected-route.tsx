"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [showSessionExpired, setShowSessionExpired] = useState(false)
  const [isInAuthFlow, setIsInAuthFlow] = useState(false)
  
  // Check if we're currently in an auth flow
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkAuthFlow = () => {
        const isAuthTransitioning = window.sessionStorage.getItem('auth_transitioning') === 'true';
        const isOnAuthPath = window.location.pathname.includes('/auth/') || 
                            window.location.pathname.includes('/login') ||
                            window.location.pathname.includes('/callback');
        const hasAuthParams = window.location.search.includes('code=') || 
                             window.location.search.includes('state=');
        
        const inAuthFlow = isAuthTransitioning || isOnAuthPath || hasAuthParams;
        setIsInAuthFlow(inAuthFlow);
        
        if (inAuthFlow) {
          console.log("Currently in auth flow - suppressing session expired messages");
          setShowSessionExpired(false);
          setAuthError(false);
        }
      };
      
      checkAuthFlow();
      
      // Listen for URL changes during navigation
      const handleLocationChange = () => {
        setTimeout(checkAuthFlow, 100); // Small delay to let navigation complete
      };
      
      window.addEventListener('popstate', handleLocationChange);
      return () => {
        window.removeEventListener('popstate', handleLocationChange);
      };
    }
  }, []);
  
  // Check if we're in a logout transition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthTransitioning = window.sessionStorage.getItem('auth_transitioning') === 'true';
      if (isAuthTransitioning) {
        console.log("Auth is in transitioning state (logout in progress)");
        setIsInAuthFlow(true); // Treat logout as auth flow
        setAuthError(true);
        
        // Clear the flag after a longer delay
        setTimeout(() => {
          window.sessionStorage.removeItem('auth_transitioning');
          setIsInAuthFlow(false);
        }, 10000); // Longer timeout for logout
      }
    }
  }, []);
  
  // Safely access auth hooks
  let auth, isBackendAuthenticated, isBackendLoading;
  try {
    const authResult = useAuth();
    auth = authResult;
    
    const backendAuthResult = useBackendAuth();
    isBackendAuthenticated = backendAuthResult.isBackendAuthenticated;
    isBackendLoading = backendAuthResult.isLoading;
  } catch (error) {
    console.error("Auth error in ProtectedRoute:", error);
    // Only set auth error if we're not in an auth flow
    if (!isInAuthFlow) {
      setAuthError(true);
    }
    auth = { loading: false, user: null };
    isBackendAuthenticated = false;
    isBackendLoading = false;
  }
  
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isOnAuthPath = window.location.pathname.includes('/auth/') || 
                          window.location.pathname.includes('/login') ||
                          window.location.pathname.includes('/dashboard') ||
                          window.location.search.includes('code=');
      
      if (isOnAuthPath) {
        // Never show session expired on auth-related paths
        setShowSessionExpired(false);
        setAuthError(false);
      }
    }
  }, []);

  useEffect(() => {
    // Never show session expired if we're in an auth flow
    if (isInAuthFlow) {
      setShowSessionExpired(false);
      return;
    }
    
    // Handle auth transition errors only if not in auth flow
    if (authError && !isInAuthFlow) {
      // Much longer delay before showing session expired
      const timer = setTimeout(() => {
        setShowSessionExpired(true);
        
        // Then redirect after showing the message
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/sso?fresh=true';
          }
        }, 2000);
      }, 3000); // Wait 3 seconds before showing session expired
      
      return () => clearTimeout(timer);
    }
    
    // Don't show session expired if we're still loading auth
    if (auth?.loading || isBackendLoading) {
      setShowSessionExpired(false);
      return;
    }
    
    // Only perform the auth check once when the component mounts
    if (hasCheckedAuth) {
      return
    }

    // Only proceed when both auth states are settled and not in auth flow
    if (!auth.loading && !isBackendLoading && !isInAuthFlow) {
      if (!auth.user) {
        // Add delay before redirecting to avoid flash during fresh login
        const redirectTimer = setTimeout(() => {
          router.push("/login");
        }, 1000); // Longer delay
        
        return () => clearTimeout(redirectTimer);
      } else if (!isBackendAuthenticated) {
        console.log("Authenticated with WorkOS but not with backend yet")
      }
      
      // Mark that we've checked auth status
      setHasCheckedAuth(true)
      setLoading(false)
    }
  }, [auth?.user, auth?.loading, isBackendAuthenticated, isBackendLoading, hasCheckedAuth, router, authError, isInAuthFlow])
  
  // Never show session expired during auth flow
  if (authError && showSessionExpired && !isInAuthFlow) {
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
  
  // Show loading state for initial auth check or during transitions
  if ((loading && !hasCheckedAuth) || isInAuthFlow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return <>{children}</>
} 