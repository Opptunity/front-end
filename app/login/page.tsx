"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import AnimatedButton from "@/components/animations/animated-button"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, isRTL } = useLanguage()
  
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  
  // Check for success parameter in URL when component mounts
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true') {
      setSuccessMessage(t("magicLinkSent") || "Authentication successful!")
      // Optional: Clear the success parameter from the URL without page reload
      window.history.replaceState({}, document.title, '/login')
    }
  }, [searchParams, t])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")
    
    try {
      // Using the new SSO signin endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/sso/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("loginFailed"))
      }
      
      setSuccessMessage(t("magicLinkSent") || "Magic link sent! Please check your email.")
      
      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push('/login/success')
      }, 1500)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("loginError"))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <Link href="/">
            <h2 className="text-3xl font-bold text-blue-600 mb-2">Opptunity</h2>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {t("login")}
          </h2>
          <p className="text-gray-600">
            {t("enterEmail")}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">{t("emailAddress")}</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder={t("emailAddress")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {errorMessage && (
            <div className="text-red-500 text-sm">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="text-green-500 text-sm">
              {successMessage}
            </div>
          )}
          
          <div>
            <AnimatedButton
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </span>
              ) : null}
              {isSubmitting ? t("loggingIn") : t("loginWithEmail")}
            </AnimatedButton>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
            {t("backToHome")}
          </Link>
        </div>
      </motion.div>
    </div>
  )
} 