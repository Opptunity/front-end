"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import AnimatedButton from "@/components/animations/animated-button"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'
import ProtectedRoute from "@/components/protected-route"

// Define the Assessment interface
interface Assessment {
  id: string
  title?: string
  UserAssessment?: {
    createdAt: string
    score: number
  }
  summary?: string
  createdAt?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const { backendUser } = useBackendAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [assessmentsLoading, setAssessmentsLoading] = useState(true)
  
  useEffect(() => {
    // Function to fetch user assessments
    const fetchUserAssessments = async () => {
      if (!auth.user?.email && !backendUser?.email) return;
      
      try {
        setAssessmentsLoading(true)
        // Get the user email from auth context
        const userEmail = auth.user?.email || backendUser?.email || '';
        
        // Fetch assessments from our local API
        const response = await fetch(`/api/assessments/user?email=${encodeURIComponent(userEmail)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to fetch assessments:', errorData);
          setAssessments([]);
          return;
        }
        
        const data = await response.json()
        setAssessments(data)
      } catch (error) {
        console.error('Error fetching assessments:', error)
        setAssessments([])
      } finally {
        setAssessmentsLoading(false)
      }
    }
    
    fetchUserAssessments()
  }, [auth.user, backendUser]) // Refresh when user changes
  
  useEffect(() => {
    // Clear any auth transition flags when we successfully reach dashboard
    if (typeof window !== 'undefined') {
      // Clear all auth-related flags
      window.sessionStorage.removeItem('auth_transitioning');
      window.sessionStorage.removeItem('suppress_session_expired');
      
      // Clear any error states that might be lingering
      const clearErrorStates = () => {
        const url = new URL(window.location.href);
        if (url.searchParams.has('error')) {
          url.searchParams.delete('error');
          window.history.replaceState({}, document.title, url.toString());
        }
      };
      
      clearErrorStates();
      
      console.log('Dashboard loaded - all auth flags cleared');
    }
  }, []);
  
  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Set a flag to indicate we're actively logging out
      // This helps other components avoid accessing auth during transitions
      window.sessionStorage.setItem('auth_transitioning', 'true');
      
      // First, check for any stored credentials in local storage or session storage
      localStorage.clear();
      // Don't clear sessionStorage completely as we just set our flag
      // Just remove specific auth items if needed
      sessionStorage.removeItem('authkit_state');
      sessionStorage.removeItem('backendAuthToken');
      
      // Clear browser cache for the current page to prevent any cached auth tokens
      if ('caches' in window) {
        try {
          const cacheNames = await window.caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => window.caches.delete(cacheName))
          );
          console.log('Browser caches cleared');
        } catch (cacheError) {
          console.warn('Error clearing caches:', cacheError);
        }
      }
      
      // Call our improved API route to handle server-side logout
      // Using GET instead of POST to allow proper redirect handling by the browser
      console.log('Redirecting to proper WorkOS logout endpoint');
      
      // Direct browser navigation to the signout endpoint
      // This will properly redirect to WorkOS for session invalidation
      window.location.href = `/api/auth/signout?cb=${Date.now()}`;
      
      // The function ends here as we're redirecting the browser
      return;
    } catch (error) {
      console.error("Logout error:", error);
      
      // If anything fails, try going to signout directly as fallback
      window.sessionStorage.setItem('auth_transitioning', 'true');
      window.location.href = `/api/auth/signout?cb=${Date.now()}`;
    }
  }
  
  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Opptunity</h1>
            </Link>
            <div className="flex items-center space-x-6">
              <span className="text-gray-700 font-medium">
                {t("welcome") || "welcome"}, <span className="text-blue-600 font-semibold">{auth.user?.firstName || backendUser?.username || "User"}</span>
              </span>
             {/*  <Link 
                href="/profile" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-150"
              >
                {t("profile") || "Profile"}
              </Link> */}
            <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-150"
              >
                {t("logout") || "Logout"}
              </button> 
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* Overview Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  {t("Dashboard") || "Dashboard"}
                </h2>
                <p className="text-gray-600 max-w-3xl">
                  Access your single staffing solution to manage individual talent placement efficiently.
                </p>
              </div>
            </div>
            
            {/* Single Staffing Feature Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">👤</span> {t("Single Staffing") || "Single Staffing"}
              </h3>
              
              <div className="space-y-8">
                {/* Main Workflow Overview */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-1">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-t-lg"></div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-2xl font-semibold text-gray-800">
                          {t("single Staffing") || "Single Staffing Workflow"}
                        </h4>
                        <p className="text-gray-600 mt-1">
                          Unified platform for Account Managers and Delivery Managers
                        </p>
                      </div>
                    </div>
                    
                    {/* Workflow Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-800 mb-1 text-sm">Customer</h5>
                        <p className="text-xs text-gray-600">Requirements</p>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <path d="M20 8v6"></path>
                            <path d="M23 11h-6"></path>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-800 mb-1 text-sm">Account Manager</h5>
                        <p className="text-xs text-gray-600">Create Ticket</p>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-800 mb-1 text-sm">Delivery Manager</h5>
                        <p className="text-xs text-gray-600">Profiler Match</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Role-Specific Dashboards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Account Manager Dashboard */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-1">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-t-lg"></div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <path d="M20 8v6"></path>
                            <path d="M23 11h-6"></path>
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Account Manager Portal
                        </h4>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Receive customer requirements
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Create structured tickets
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Track ticket progress
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Client communication hub
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Link href="/create-ticket" className="block">
                          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                            <span>Create New Ticket</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                          </button>
                        </Link>
                        <Link href="/my-tickets" className="block">
                          <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                            <span>View My Tickets</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>

                  {/* Delivery Manager Dashboard */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-1">
                      <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-t-lg"></div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Delivery Manager Portal
                        </h4>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Review incoming tickets
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Access profiler database
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Check availability status
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Coordinate placements
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Link href="/delivery-manager/tickets" className="block">
                          <button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                            <span>View Ticket Queue</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                              <path d="M3 3h18v18H3z"></path>
                              <path d="M8 8h8"></path>
                              <path d="M8 12h8"></path>
                              <path d="M8 16h5"></path>
                            </svg>
                          </button>
                        </Link>
                        <Link href="/delivery-manager/profilers" className="block">
                          <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                            <span>Profiler Directory</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <path d="M20 8v6"></path>
                              <path d="M23 11h-6"></path>
                            </svg>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Unified System Features */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-blue-600">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6"></path>
                        <path d="M21 12h-6m-6 0H3"></path>
                      </svg>
                      Unified System Features
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 3h18v18H3z"></path>
                            <path d="M8 8h8"></path>
                            <path d="M8 12h8"></path>
                            <path d="M8 16h5"></path>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-800 mb-2">Ticket System</h5>
                        <p className="text-sm text-gray-600">Centralized ticket management with status tracking and automated routing</p>
                      </div>
                      
                      <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <path d="M20 8v6"></path>
                            <path d="M23 11h-6"></path>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-800 mb-2">Profiler Database</h5>
                        <p className="text-sm text-gray-600">Comprehensive database of available talent with skills and availability tracking</p>
                      </div>
                      
                      <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-800 mb-2">Real-time Collaboration</h5>
                        <p className="text-sm text-gray-600">Seamless communication between all stakeholders with instant updates</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Hidden Features - Commented out for Single Staffing Focus
            
            {/* Agents section */}
            {/*
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">🤖</span> {t("your Agents") || "Your Agents"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Career Agent Button */}
                {/*
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-1">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-t-lg"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-3a2 2 0 0 1-2-2V2"></path><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M9 13h6"></path><path d="M9 17h3"></path></svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {t("careerAgent") || "Career Agent"}
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-6 h-12">
                      {t("careerAgentDescription") || "Get personalized career advice and guidance"}
                    </p>
                    <Link href="/career-agent" className="block">
                      <AnimatedButton className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center">
                        <span>{t("useCareerAgent") || "Use Career Agent"}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </AnimatedButton>
                    </Link>
                  </div>
                </motion.div>
                
                {/* General Agent Button */}
                {/*
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-1">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-t-lg"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {t("generalAgent") || "General Agent"}
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-6 h-12">
                      {t("generalAgentDescription") || "Get answers to general questions"}
                    </p>
                    <Link href="/ai-agent" className="block">
                      <AnimatedButton className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center">
                        <span>{t("useGeneralAgent") || "Use General Agent"}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </AnimatedButton>
                    </Link>
                  </div>
                </motion.div>

                {/* Engineer Ranking Button - NOUVEAU */}
                {/*
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-1">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-t-lg"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M20 8v6"></path><path d="M23 11h-6"></path></svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Engineer Ranking
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-6 h-12">
                      Use AI to rank and match engineers to project tasks
                    </p>
                    <Link href="/engineer-ranking" className="block">
                      <AnimatedButton className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 flex items-center justify-center">
                        <span>Rank Engineers</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </AnimatedButton>
                    </Link>
                  </div>
                </motion.div>

                {/* Engineer Onboarding Button - NEW */}
                {/*
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-1">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-t-lg"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M20 8v6"></path><path d="M23 11h-6"></path></svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Engineer Onboarding
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-6 h-12">
                      Comprehensive onboarding workflow for new team members
                    </p>
                    <Link href="/onboarding" className="block">
                      <AnimatedButton className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 flex items-center justify-center">
                        <span>Start Onboarding</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </AnimatedButton>
                    </Link>
                  </div>
                </motion.div>
                
                {/* Skill Assessment Button */}
                {/*
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-1">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-t-lg"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {t("skillAssessment") || "Skill Assessment"}
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-6 h-12">
                      Evaluate your skills and identify areas for improvement
                    </p>
                    <Link href="/assessment?source=dashboard" className="block">
                      <AnimatedButton className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center justify-center">
                        <span>{t("skillAssessment") || "Start Assessment"}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </AnimatedButton>
                    </Link>
                  </div>
                </motion.div>

                {/* CV Skills Assessment Button - NEW */}
                {/*
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-1">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-t-lg"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13a4 4 0 0 0-8 0"></path><path d="M12 13v3"></path></svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        CV Skills Analysis
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-6 h-12">
                      Create employee profiles and analyze skills from CVs using AI
                    </p>
                    <Link href="/onboarding-cv" className="block">
                      <AnimatedButton className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 flex items-center justify-center">
                        <span>Analyze CV Skills</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </AnimatedButton>
                    </Link>
                  </div>
                </motion.div>

                {/* IT Trends Explorer Button - NEW */}
                {/*
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-1">
                    <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-t-lg"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        IT Trends Explorer
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-6 h-12">
                      Discover trending technologies and get personalized recommendations
                    </p>
                    <Link href="/it-trends" className="block">
                      <AnimatedButton className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 flex items-center justify-center">
                        <span>Explore Trends</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </AnimatedButton>
                    </Link>
                  </div>
                </motion.div>

                {/* Engineers Directory Button - NEW */}
                {/*
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-1">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-t-lg"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M20 8v6"></path><path d="M23 11h-6"></path></svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Engineers Directory
                      </h4>
                    </div>
                    <p className="text-gray-600 mb-6 h-12">
                      View and manage engineer profiles with their CV assessments
                    </p>
                    <Link href="/engineers" className="block">
                      <AnimatedButton className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center justify-center">
                        <span>View Engineers</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </AnimatedButton>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Recent Activity Section */}
            {/*
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📊</span> {t("Recent Activity") || "Recent Activity"}
              </h3>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {assessmentsLoading ? (
                  <div className="p-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">{t("loading") || "Loading..."}</span>
                  </div>
                ) : assessments.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {assessments.map((assessment) => (
                      <motion.div 
                        key={assessment.id} 
                        className="p-6 hover:bg-blue-50 transition-colors duration-150"
                        whileHover={{ x: 5 }}
                      >
                        <Link href={`/assessment/${assessment.id}`} className="block">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {assessment.title || "Skills Assessment"}
                              </h4>
                              <p className="text-gray-600 mt-2 line-clamp-2">
                                {assessment.summary ? 
                                  assessment.summary.substring(0, 120) + (assessment.summary.length > 120 ? "..." : "") : 
                                  "Completed assessment"}
                              </p>
                            </div>
                            <div className="text-right ml-6">
                              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {assessment.UserAssessment?.createdAt ? 
                                  formatDate(assessment.UserAssessment.createdAt) : 
                                  assessment.createdAt ? formatDate(assessment.createdAt) : "Recently"}
                              </span>
                              {assessment.UserAssessment?.score && (
                                <div className="mt-3">
                                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 6H3"></path><path d="M16 10H3"></path><path d="M12 14H3"></path><path d="M8 18H3"></path><path d="m16 18-3.5-3.5 3.5-3.5"></path></svg>
                                    <span className="font-medium">
                                      {t("score") || "Score"}: {assessment.UserAssessment.score}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <p className="text-gray-500 text-lg">
                      {t("No Recent Activity") || "No recent activity"}
                    </p>
                    <p className="text-gray-400 mt-1">
                      Complete an assessment to see your results here
                    </p>
                  </div>
                )}
              </div>
            </div>
            */}
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 