"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import ScrollReveal from "./animations/scroll-reveal"
import AnimatedButton from "./animations/animated-button"
import { useLanguage } from "@/contexts/language-context"
import { useState } from "react"
import { FormEvent } from "react"

export default function SecondaryCta() {
  const { t, isRTL } = useLanguage()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (data.success) {
        setStatus('success')
        setMessage(data.message || 'Thank you for joining our waitlist!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.message || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setStatus('error')
      setMessage('Failed to submit. Please try again later.')
    }
  }

  return (
    <section id="waitlist-form" className="py-20 bg-blue-600 text-white relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500 opacity-20"
        animate={{
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 20,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-400 opacity-10"
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 25,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("readyTitle")}</h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl mb-10 max-w-3xl mx-auto">{t("readySubtitle")}</p>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <form id="email-form" onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="flex-grow px-6 py-6 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className={`bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-md transition duration-200 ease-in-out ${
                  status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {status === 'loading' ? 'Submitting...' : t("joinWaitlist")}
              </button>
            </form>
          </ScrollReveal>

          {status === 'success' && (
            <div className="mt-4 p-2 bg-green-100 text-green-800 rounded-md">
              {message}
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md">
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

