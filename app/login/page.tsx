"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import AnimatedButton from "@/components/animations/animated-button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      setMessage({
        text: data.message || "Login link sent to your email!",
        type: "success",
      })

      // If we have a preview URL (for development with Ethereal)
      if (data.previewUrl) {
        console.log("Preview URL:", data.previewUrl)
      }
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Failed to send login link",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <motion.div
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Opptunity</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-800">
            {t("loginWelcome") || "Welcome Back"}
          </h2>
        </div>

        {message && (
          <div
            className={`p-4 my-4 rounded-md ${
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t("emailAddress") || "Email Address"}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("emailPlaceholder") || "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <AnimatedButton
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? t("sendingLink") || "Sending..." : t("sendLoginLink") || "Send Login Link"}
            </AnimatedButton>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">{t("noAccountYet") || "Don't have an account?"}</span>{" "}
          <Link href="/#waitlist-form" className="text-blue-600 hover:text-blue-800 font-medium">
            {t("joinWaitlist") || "Join the Waitlist"}
          </Link>
        </div>
      </motion.div>
    </div>
  )
} 