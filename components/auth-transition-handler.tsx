'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AuthTransitionHandler({ children }: { children: React.ReactNode }) {
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for auth transition state
      const checkTransition = () => {
        const transitioning = window.sessionStorage.getItem('auth_transitioning') === 'true';
        const isOnAuthPath = pathname.includes('/auth/') || 
                            pathname.includes('/login') ||
                            pathname.includes('/callback');
        const hasAuthParams = window.location.search.includes('code=') || 
                             window.location.search.includes('state=');
        
        const inTransition = transitioning || isOnAuthPath || hasAuthParams;
        setIsAuthTransitioning(inTransition);
        
        // Set a flag that other components can check
        if (inTransition) {
          window.sessionStorage.setItem('suppress_session_expired', 'true');
        } else {
          // Remove the flag after a delay to ensure auth flow is complete
          setTimeout(() => {
            window.sessionStorage.removeItem('suppress_session_expired');
          }, 2000);
        }
      };
      
      checkTransition();
      
      // Listen for storage changes and URL changes
      window.addEventListener('storage', checkTransition);
      
      // Check periodically during transitions
      const interval = setInterval(checkTransition, 200);
      
      return () => {
        window.removeEventListener('storage', checkTransition);
        clearInterval(interval);
      };
    }
  }, [pathname]);
  
  if (isAuthTransitioning) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 