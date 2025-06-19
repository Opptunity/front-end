'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useRouter } from 'next/navigation';

// Define the shape of our user object
type BackendUser = {
  id?: string;
  email: string;
  username?: string;
  role?: string;
  jobTitle?: string;
};

// Define the shape of our context
type BackendAuthContextType = {
  backendUser: BackendUser | null;
  isBackendAuthenticated: boolean;
  isLoading: boolean;
  registerOrAuthenticateUser: () => Promise<void>;
  logout: () => Promise<void>;
};

// Storage key for backend auth data
const BACKEND_AUTH_STORAGE_KEY = 'backendAuthData';

// Create the context
const BackendAuthContext = createContext<BackendAuthContextType | null>(null);

// Provider component
export function BackendAuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to register or authenticate user with backend
  const registerOrAuthenticateUser = async () => {
    if (!auth.user) return;

    try {
      console.log('Starting authentication process for:', auth.user.email);

      // Check if the user already exists in the backend
      console.log('Attempting to login user with backend API');
      const loginResponse = await fetch(`/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: auth.user.email,
        }),
      });

      console.log('Login response status:', loginResponse.status);

      if (loginResponse.ok) {
        // User exists, we're authenticated
        const loginData = await loginResponse.json();
        console.log('Login successful, user data:', loginData);
        setBackendUser(loginData.user);

        // Cache the authentication data
        localStorage.setItem(BACKEND_AUTH_STORAGE_KEY, JSON.stringify({
          user: loginData.user,
          email: auth.user.email,
          timestamp: Date.now(),
        }));

        return;
      } else {
        // Log response details if login failed
        const errorText = await loginResponse.text();
        console.log('Login failed with status:', loginResponse.status, 'Response:', errorText);
      }

      // If login failed, try to register the user
      console.log('Attempting to register user with backend API');
      const registerResponse = await fetch(`/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: auth.user.firstName || auth.user.email.split('@')[0],
          email: auth.user.email,
          role: 'jobSeeker', // Default role
          jobTitle: ''
        }),
      });

      console.log('Register response status:', registerResponse.status);

      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        console.log('Registration successful, user data:', registerData);
        setBackendUser(registerData.user);

        // Cache the authentication data
        localStorage.setItem(BACKEND_AUTH_STORAGE_KEY, JSON.stringify({
          user: registerData.user,
          email: auth.user.email,
          timestamp: Date.now(),
        }));
      } else {
        const errorText = await registerResponse.text();
        console.error('Failed to register user with backend. Status:', registerResponse.status, 'Response:', errorText);
      }
    } catch (error) {
      console.error('Error authenticating with backend:', error);
    }
  };

  const logout = async () => {
    try {
      console.log('Backend context: Logging out user...');
      
      // First clear local data
      setBackendUser(null);
      localStorage.removeItem(BACKEND_AUTH_STORAGE_KEY);
      console.log('Backend context: Local state and storage cleared');
      
      // Set a special flag to prevent auto-login on next page load
      localStorage.setItem('forceFullAuth', 'true');
      console.log('Backend context: Force full auth flag set');
      
      // For client-side logout, use window.location for a full page navigation
      // This is more reliable than router.push for auth-related redirects
      if (typeof window !== 'undefined') {
        // Use window.location.href for a full page navigation to signout endpoint
        // which will then redirect to SSO
        console.log('Backend context: Redirecting to signout page');
        window.location.href = '/api/auth/signout';
      } else {
        // Fallback to router.push in SSR contexts (though this shouldn't happen in client components)
        console.log('Backend context: Using router for SSR context');
        router.push('/auth/sso');
      }
      
      // No need to wait for API response since we're redirecting
      return;
    } catch (error) {
      console.error('Error during sign out:', error);
      
      // Always clear local data even if redirect fails
    setBackendUser(null);
    localStorage.removeItem(BACKEND_AUTH_STORAGE_KEY);
      console.log('Backend context: Cleared data after error');
      
      // Still try to redirect to SSO on error
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/sso';
      }
    }
  };

  // Only check cache and call backend if needed
  useEffect(() => {
    const initializeAuth = async () => {
      if (auth.loading) return;

      if (auth.user) {
        // Check if we're in a fresh login process
        let isInAuthFlow = false;
        if (typeof window !== 'undefined') {
          isInAuthFlow = window.location.pathname.includes('/auth/') || 
                        window.location.pathname.includes('/login') ||
                        window.sessionStorage.getItem('auth_transitioning') === 'true';
        }
        
        if (isInAuthFlow) {
          console.log('In auth flow, skipping cache check');
          await registerOrAuthenticateUser();
          setIsLoading(false);
          return;
        }

        // Check if we have a force full auth flag set during logout
        const forceFullAuth = localStorage.getItem('forceFullAuth');
        if (forceFullAuth === 'true') {
          localStorage.removeItem('forceFullAuth');
          setBackendUser(null);
          setIsLoading(false);
          return;
        }

        // Check cache for existing auth
        const cachedData = localStorage.getItem(BACKEND_AUTH_STORAGE_KEY);
        let isValidCache = false;
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            if (
              parsedData.email === auth.user.email &&
              parsedData.timestamp > Date.now() - 24 * 60 * 60 * 1000 // 24 hour cache
            ) {
              isValidCache = true;
              setBackendUser(parsedData.user);
            }
          } catch (e) {
            localStorage.removeItem(BACKEND_AUTH_STORAGE_KEY);
          }
        }
        
        if (!isValidCache) {
          await registerOrAuthenticateUser();
        }
      } else {
        setBackendUser(null);
        localStorage.removeItem(BACKEND_AUTH_STORAGE_KEY);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [auth.user, auth.loading]);

  return (
    <BackendAuthContext.Provider
      value={{
        backendUser,
        isBackendAuthenticated: !!backendUser,
        isLoading,
        registerOrAuthenticateUser,
        logout
      }}
    >
      {children}
    </BackendAuthContext.Provider>
  );
}

// Hook to use the auth context
export function useBackendAuth() {
  const context = useContext(BackendAuthContext);
  if (!context) {
    throw new Error('useBackendAuth must be used within a BackendAuthProvider');
  }
  return context;
}
