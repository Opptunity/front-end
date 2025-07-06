"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import AnimatedButton from "@/components/animations/animated-button"

export default function SignupPage() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [role, setRole] = useState("job_seeker")
  const [jobTitle, setJobTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, role, jobTitle }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("signupFailed") || "Signup failed")
      }
      
      // Success - redirect to login or dashboard
      setSuccessMessage(t("accountCreated") || "Account created successfully")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("signupError") || "An error occurred during signup")
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
            {t("signup") || "Sign Up"}
          </h2>
          <p className="text-gray-600">
            {t("createAccount") || "Create your account to get started"}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">{t("username") || "Username"}</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t("username") || "Username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">{t("emailAddress") || "Email Address"}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t("emailAddress") || "Email Address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="jobTitle" className="sr-only">{t("jobTitle") || "Job Title"}</label>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                autoComplete="organization-title"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t("jobTitle") || "Job Title"}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="role" className="sr-only">{t("role") || "Role"}</label>
              <select
                id="role"
                name="role"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="job_seeker">{t("jobSeeker") || "Job Seeker"}</option>
                <option value="employer">{t("employer") || "Employer"}</option>
                <option value="recruiter">{t("recruiter") || "Recruiter"}</option>
              </select>
            </div>
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
              {isSubmitting ? (t("signingUp") || "Signing Up...") : (t("createAccount") || "Create Account")}
            </AnimatedButton>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t("alreadyHaveAccount") || "Already have an account?"}{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              {t("login") || "Login"}
            </Link>
          </p>
          <div className="mt-2">
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              {t("backToHome") || "Back to Home"}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 