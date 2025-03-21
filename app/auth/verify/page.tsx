"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import AnimatedButton from "@/components/animations/animated-button"

// Create a client component that uses useSearchParams
function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  
  useEffect(() => {
    const token = searchParams.get("token")
    
    if (!token) {
      setStatus("error")
      setMessage("Invalid or missing token")
      return
    }
    
    const verifyToken = async () => {
      try {
        // Call the verifyLoginToken endpoint with the token
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/users/verify?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify token')
        }
        
        // Store the JWT token in localStorage for authentication
        localStorage.setItem('authToken', data.token)
        
        setStatus("success")
        setMessage("Verification successful! You are now logged in.")
        
        // Redirect to dashboard after successful verification
        setTimeout(() => router.push("/dashboard"), 2000)
      } catch (error) {
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Failed to verify your login token")
      }
    }
    
    verifyToken()
  }, [searchParams, router])
  
  // Return the JSX content
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <motion.div
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <Link href="/">
            <h2 className="text-3xl font-bold text-blue-600 mb-2">Opptunity</h2>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {t("verifyingLogin") || "Verifying your login"}
          </h2>
        </div>
        
        <div className="mt-6">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">{t("verifying") || "Verifying your login..."}</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-lg text-gray-800">{message}</p>
              <div className="mt-6">
                <Link href="/dashboard">
                  <AnimatedButton className="bg-blue-600 text-white hover:bg-blue-700">
                    {t("goToDashboard") || "Go to Dashboard"}
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          )}
          
          {status === "error" && (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-4 text-lg text-gray-800">{message}</p>
              <div className="mt-6">
                <Link href="/login">
                  <AnimatedButton className="bg-blue-600 text-white hover:bg-blue-700">
                    {t("tryAgain") || "Try Again"}
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Main page component with Suspense
export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
} 