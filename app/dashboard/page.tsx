"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import AnimatedButton from "@/components/animations/animated-button"

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")
  
  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken')
    
    if (!authToken) {
      // Redirect to login if not authenticated
      router.push("/login")
      return
    }
    
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch user profile")
        }
        
        const data = await response.json()
        setUserName(data.name || "User")
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [router])
  
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    router.push("/login")
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-blue-600">Opptunity</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{t("welcome") || "Welcome"}, {userName}</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
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
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {t("skillsDashboard") || "Skills Dashboard"}
          </h2>
          
          {/* Agents section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {t("yourAgents") || "yourAgents"}
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Career Agent Button */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {t("careerAgent") || "careerAgent"}
                </h4>
                <p className="text-gray-600 mb-4">
                  {t("careerAgentDescription") || "careerAgentDescription"}
                </p>
                <Link href="/career-agent">
                  <AnimatedButton className="bg-blue-600 text-white hover:bg-blue-700">
                    {t("useCareerAgent") || "useCareerAgent"}
                  </AnimatedButton>
                </Link>
              </div>
              
              {/* General Agent Button */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {t("generalAgent") || "generalAgent"}
                </h4>
                <p className="text-gray-600 mb-4">
                  {t("generalAgentDescription") || "generalAgentDescription"}
                </p>
                <Link href="/ai-agent">
                  <AnimatedButton className="bg-blue-600 text-white hover:bg-blue-700">
                    {t("useGeneralAgent") || "useGeneralAgent"}
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Section */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {t("recentActivity") || "recentActivity"}
            </h3>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 text-center text-gray-500">
                {t("noRecentActivity") || "noRecentActivity"}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 