"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export default function Profile() {
  const { t } = useLanguage()
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [cvAnalysis, setCvAnalysis] = useState(null)
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(true)

  useEffect(() => {
    // Fetch CV analysis data
    const fetchCvAnalysis = async () => {
      try {
        setIsAnalysisLoading(true)
        // Using a mock user ID since we're skipping authentication check
        const mockUserId = "demo-user-123"
        // Replace with actual API endpoint for CV analysis
        const response = await fetch(`/api/profile/cv-analysis?userId=${mockUserId}`)
        if (!response.ok) throw new Error("Failed to fetch CV analysis")
        const data = await response.json()
        setCvAnalysis(data)
      } catch (error) {
        console.error("Error fetching CV analysis:", error)
      } finally {
        setIsAnalysisLoading(false)
      }
    }

    fetchCvAnalysis()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
            {user?.username ? user.username.charAt(0).toUpperCase() : "D"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.username || "Demo User"}</h1>
            <p className="text-gray-600">{user?.email || "demo@example.com"}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">{t("cv_analysis") || "CV Analysis"}</h2>
          
          {isAnalysisLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : cvAnalysis ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">{t("skills_assessment") || "Skills Assessment"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cvAnalysis.skills?.map((skill, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{skill.name}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">{t("no_skills_found") || "No skills data available"}</p>}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">{t("experience_summary") || "Experience Summary"}</h3>
                <p>{cvAnalysis.experienceSummary || t("no_experience_summary") || "No experience summary available"}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">{t("improvement_areas") || "Areas for Improvement"}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {cvAnalysis.improvementAreas?.map((area, index) => (
                    <li key={index}>{area}</li>
                  )) || <p className="text-gray-500">{t("no_improvement_areas") || "No improvement areas identified"}</p>}
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">{t("job_fit") || "Job Fit Analysis"}</h3>
                <div className="space-y-4">
                  {cvAnalysis.jobFit?.map((job, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <span className="font-medium">{job.title}</span>
                        <span className="text-blue-500">{job.matchPercentage}% {t("match") || "match"}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                    </div>
                  )) || <p className="text-gray-500">{t("no_job_fit_data") || "No job fit data available"}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 mb-4">{t("no_cv_uploaded") || "No CV has been uploaded or analyzed yet."}</p>
              <Link 
                href="/dashboard" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                {t("upload_cv") || "Upload your CV"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 