"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import AnimatedButton from "@/components/animations/animated-button"
import { useAuth } from '@workos-inc/authkit-nextjs/components'

export default function LoginSuccessPage() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const auth = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Check if the user is authenticated with WorkOS
    if (!auth.loading) {
      setIsLoading(false)
    }
  }, [auth])
  
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
          
          {isLoading ? (
            <div className="my-6 flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">{t("processingRequest") || "Processing your request..."}</span>
            </div>
          ) : (
            <div className="my-6 text-green-500 text-lg">
              {t("magicLinkSent") || "Magic link sent!"}
            </div>
          )}
          
          <p className="text-gray-600 mt-2">
            {t("checkYourEmail") || "Please check your email inbox for the magic link to continue."}
          </p>
          
          <div className="mt-4 text-sm text-gray-500">
            {t("magicLinkNote") || "The magic link will expire in 1 hour. If you don't see the email, please check your spam folder."}
          </div>
        </div>
        
        {!isLoading && (
          <div className="mt-6 text-center">
            <div className="mb-4">
              <AnimatedButton
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                onClick={() => router.push('/login')}
              >
                {t("tryAgain") || "Try Again"}
              </AnimatedButton>
            </div>
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              {t("backToHome") || "Back to Home"}
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
} 