'use client';

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { signOut } from '@workos-inc/authkit-nextjs';
import { useBackendAuth } from '@/contexts/backend-auth-context';

export default function SignOutButton() {
  const { logout: backendLogout } = useBackendAuth();
  
  const handleSignOut = async () => {
    try {
      // Clear local storage
      localStorage.clear();
      
      // Logout from backend
      await backendLogout();
      
      // Use AuthKit's signOut function
      await signOut({ returnTo: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <button 
      onClick={handleSignOut}
      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Sign Out
    </button>
  );
} 