"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'
import ProtectedRoute from "@/components/protected-route"

// Define the assessment type based on the API response
interface SkillGap {
  area: string;
  improvement: string;
}

interface Assessment {
  id: string
  skillGaps?: string | SkillGap[]
  email?: string
  status?: string
  createdAt?: string
  completedAt?: string
  jobTitle?: string
  industry?: string
  experienceLevel?: string
  technicalSkills?: number
  leadership?: number
  communication?: number
  problemSolving?: number
  teamwork?: number
  primaryGoal?: string
  score?: number
  title?: string // For backward compatibility
  UserAssessment?: {
    createdAt: string
    score: number
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const auth = useAuth()
  const { backendUser } = useBackendAuth()
  
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [debug, setDebug] = useState(false) // For debugging
  
  useEffect(() => {
    const fetchUserAssessments = async () => {
      try {
        setLoading(true)
        // Get the user ID either from auth context or localStorage
        const userId = localStorage.getItem('userEmail')
        
        // Disable cache to prevent 304 responses
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/assessments/user?email=${userId || 'missing'}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch assessments')
        }
        
        const data = await response.json()
        console.log('API Response:', data) // Debug: Log the actual response
        setAssessments(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching assessments:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserAssessments()
  }, [])
  
  const handleLogout = async () => {
    localStorage.clear()
    router.push("/")
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-blue-600">Opptunity</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {t("welcome") || "Welcome"}, {auth.user?.firstName || backendUser?.username || "User"}
              </span>
              <Link 
                href="/profile" 
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {t("profile") || "Profile"}
              </Link>
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
            className="bg-white shadow rounded-lg p-6"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {t("userProfile") || "User Profile"}
            </h2>
            
            {/* User info section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                {t("personalInfo") || "Personal Information"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">{t("name") || "Name"}</p>
                  <p className="font-medium">{auth.user?.firstName || backendUser?.username || "User"}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t("email") || "Email"}</p>
                  <p className="font-medium">{auth.user?.email || backendUser?.email || "Not available"}</p>
                </div>
              </div>
            </div>
            
            {/* Assessments section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                {t("yourAssessments") || "Your Assessments"}
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">{t("loading") || "Loading assessments..."}</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                </div>
              ) : assessments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">{t("noAssessments") || "You haven't taken any assessments yet."}</p>
                  <Link href="/assessment?source=dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    {t("takeAssessment") || "Take an Assessment"}
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Debug toggle */}
                  <div className="mb-4 flex justify-end">
                    <button 
                      onClick={() => setDebug(!debug)}
                      className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      {debug ? "Hide Debug" : "Show Debug"}
                    </button>
                  </div>
                  
                  {/* Debug information */}
                  {debug && (
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg overflow-auto max-h-60">
                      <h4 className="text-sm font-semibold mb-2">Raw Response Data:</h4>
                      <pre className="text-xs">{JSON.stringify(assessments, null, 2)}</pre>
                    </div>
                  )}
                  
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("assessmentTitle") || "Assessment Title"}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("date") || "Date"}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("score") || "Score"}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("actions") || "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assessments.map((assessment) => {
                        const createdAt = assessment.UserAssessment?.createdAt || assessment.createdAt || assessment.completedAt
                        const score = assessment.UserAssessment?.score || assessment.score
                        // Use available fields for title - adapt based on your actual data
                        const title = assessment.title || "FREE UPSKILLING ASSESSMENT"
                        
                        return (
                          <tr key={assessment.id}>
                            <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                              {assessment.skillGaps ? (
                                <div className="max-w-md">
                                  {typeof assessment.skillGaps === 'string' 
                                    ? JSON.parse(assessment.skillGaps).map((gap: SkillGap, index: number) => (
                                        <div key={index} className="mb-2 pb-2 border-b border-gray-100">
                                          {gap.area && <div><span className="font-semibold">Area:</span> {gap.area}</div>}
                                          {gap.improvement && <div><span className="font-semibold">Improvement:</span> {gap.improvement}</div>}
                                        </div>
                                      ))
                                    : Array.isArray(assessment.skillGaps) 
                                      ? assessment.skillGaps.map((gap: SkillGap, index: number) => (
                                          <div key={index} className="mb-2 pb-2 border-b border-gray-100">
                                            {gap.area && <div><span className="font-semibold">Area:</span> {gap.area}</div>}
                                            {gap.improvement && <div><span className="font-semibold">Improvement:</span> {gap.improvement}</div>}
                                          </div>
                                        ))
                                      : String(assessment.skillGaps)
                                  }
                                </div>
                              ) : 'No skill gaps available'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {createdAt ? formatDate(createdAt) : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {score !== undefined ? `${score}%` : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link 
                                href={`/assessment${assessment.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {t("viewDetails") || "View Details"}
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 